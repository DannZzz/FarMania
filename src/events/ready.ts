import { Util } from "client-discord";
import { DataResolver } from "discord.js";
import { findOrCreateOne } from "../database/db";
import { Currency } from "../docs/currency/Main";
import { Event, EventRunOptions } from "../structures/Event";

export default class Ready extends Event {
    constructor () {
        super({name: "ready"})
    }

    async execute({ client, values }: EventRunOptions<DataResolver>): Promise<any> {
        async function change () {
            const bot = await findOrCreateOne("bot", {findOption: "main"});
            client.user.setActivity({type: "PLAYING", name: `Jackpot: ${Currency.dollars.emoji}${Util.formatNumber(bot.slotJackpot)}`})
        }
        change()
        setInterval(change, 60 * 1000)
        console.log(client.user.tag + " - is ready!")
    }
}