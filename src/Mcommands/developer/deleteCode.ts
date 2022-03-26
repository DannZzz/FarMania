import { MessageCollector } from "discord.js";
import ms from "ms";
import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { findOrCreateOne } from "../../database/db";
import { CodeModel } from "../../database/models/CodeModel";
import { Currency, CurrencyType } from "../../docs/currency/Main";
import { MessageCollectorExp } from "../../structures/Collector";
import { DateTime } from "../../structures/DateAndTime";
import { Embed } from "../../structures/Embed";
import { Functions } from "../../structures/Functions";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { RedeemCode } from "../../structures/RedeemCodes";

export default class addCoins extends MessageCommand {
    constructor() {
        super({
            name: "delete-code",
            description: "delete code",
            developer: true,
            hideInHelp: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (!args[0]) return Embed(msg).setError("Укажите код").send(DELETE_TIMEOUT_MESSAGES);
        const code = args[0];
        await CodeModel.deleteOne({_id: code});
        Embed(msg).setSuccess("Успешно убран.").send(DELETE_TIMEOUT_MESSAGES *2 )
    }
}