import { Util } from "client-discord"
import { JACKPOT_ADD_TIME, SLOTS_DEFAULT_JACKPOT } from "../config"
import { models } from "../database/db"
import { Loop } from "./Loop"

export class Loops {
    runAll() {
        this.jackpotAdd()
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