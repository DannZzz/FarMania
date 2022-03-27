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
        let i = 0;
        async function change () {
            const bot = await findOrCreateOne("bot", {findOption: "main"});
            const arr = [`Jackpot: ${Currency.dollars.emoji}${Util.formatNumber(bot.slotJackpot)}`]
            if (bot.lastWinner && bot.lastWinningJackpot) {
                const user = await client.users.fetch(bot.lastWinner);
                arr.push(
                    `Last Winner: ${user ? user.tag : "Unknown"} - ${Currency.dollars.emoji}${client.util.formatNumber(bot.lastWinningJackpot)}`
                );
            }
            client.user.setActivity({type: "PLAYING", name: arr.length > 1 ? arr[i % 2] : arr[0]});
            i++
        }
        change()
        
        setInterval(change, 60 * 1000)
        console.log(client.user.tag + " - is ready!")
    }
}