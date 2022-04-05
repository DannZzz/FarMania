import { Message, MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import { changeMoney, findOrCreateOne, models } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import { Embed } from "../../structures/Embed";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class addCoins extends MessageCommand {
    constructor() {
        super({
            name: "dev",
            description: "add coins",
            developer: true,
            hideInHelp: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        
        
        const data = await findOrCreateOne("bot", {findOption: "main"});
        console.log(data)
        // await models.games.deleteMany()
    }
}