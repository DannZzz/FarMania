import { Util } from "client-discord"
import { client } from "..";
import { JACKPOT_ADD_TIME, SLOTS_DEFAULT_JACKPOT } from "../config"
import { findOrCreateOne, models } from "../database/db"
import { AirplaneGame } from "./Airplane/Game";
import { Loop } from "./Loop"

export class Loops {
    async runAll() {
        await Promise.all([
            this.jackpotAdd(),
            this.doAirPlanes()
        ])
    }

    private async checkAirPlanes () {
        const bot = await findOrCreateOne("bot", {findOption: "main"});
        const planes = bot.airplanes;
        const game = new AirplaneGame(client);
        await Promise.all(
            planes.map(async plane => {
                return await game.startAndEdit(plane.guild, plane.channel)
            })
        )
        
    }

    private async doAirPlanes () {
        const game = new AirplaneGame(client);
        await game.updateMessages()
        new Loop(7 * 1000, this.checkAirPlanes).start()
        // new Loop(60 * 60 * 1000, game.updateMessages).start()
    }

    private async jackpotAdd () {
        new Loop()
            .setInterval(JACKPOT_ADD_TIME)
            .setFunction(async () => {
                await models.bot.updateOne({_id: "main"}, {$inc: {slotJackpot: Util.random(SLOTS_DEFAULT_JACKPOT, SLOTS_DEFAULT_JACKPOT * 2)}})
            })
            .start()
    }
}