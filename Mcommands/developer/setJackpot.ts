import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { Embed } from "../../structures/Embed";
import { models } from "../../database/db";

export default class setJackpot extends MessageCommand {
    constructor() {
        super({
            name: "set-jackpot",
            description: "set jackpot",
            developer: true,
            hideInHelp: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (!args[0] || isNaN(+args[0])) return Embed(msg).setError("Укажите сумму").send(DELETE_TIMEOUT_MESSAGES)
        await models.bot.updateOne({_id: "main"}, {$set: {slotJackpot: Math.round(+args[0])}})
        Embed(msg).setSuccess("Джекпот установлен!").send(DELETE_TIMEOUT_MESSAGES);

    }
}