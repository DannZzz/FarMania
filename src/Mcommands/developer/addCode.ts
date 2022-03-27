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
            name: "add-code",
            description: "add code",
            developer: true,
            hideInHelp: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (!args[0]) return Embed(msg).setError("[code] [coins | dollars | chips] [reward] <maxCount> <validDate>").send(DELETE_TIMEOUT_MESSAGES);
        const code = args[0];
        const check = await findOrCreateOne("redeemcodes", {findOption: code, denyCreation: true});
        if (check) return Embed(msg).setError(`${code} уже существует.`).send(DELETE_TIMEOUT_MESSAGES);
        if (!args[1] || !Currency[args[1]]) return Embed(msg).setError('Тип указан неверно!').send(DELETE_TIMEOUT_MESSAGES);
        const type = args[1] as CurrencyType;
        if (!args[2] || isNaN(+args[2])) return Embed(msg).setError('Укажите количество бабла!').send(DELETE_TIMEOUT_MESSAGES);
        const reward = Math.round(+args[2]);
        var maxCount: number = null
        if (args[3] && !isNaN(+args[3])) maxCount = Math.round(+args[3]);
        var validDate: Date = null;
        if (args[4] && ms(args[4])) validDate = new Date(Date.now() + ms(args[4]));
        const data = new RedeemCode(code, type, reward, maxCount, validDate);
        await data.create()
        return Embed(msg).setTitle(`Код: ${code}`).addField("Награда", `${Currency[type].emoji}\`${client.util.formatNumber(reward)}\``).addField("Макс. кол-во использований:", maxCount ? `\`${client.util.formatNumber((maxCount))}\`` : "Неограничено").addField("Доступность:", validDate ? `${DateTime.formatTime(DateTime.getTimeData(validDate.getTime()), false, Functions.getTimeLang("ru"))} (${client.timestamp(validDate.getTime(), "D")})` : "Неограничено").send();
    }
}