import { MessageEmbed } from "discord.js";
import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { models } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import { Embed } from "../../structures/Embed";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { Pagination } from "../../structures/Pagination";

export default class AllCodes extends MessageCommand {
    constructor () {
        super({
            name: "all-codes",
            description: "get all codes",
            developer: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        const codes = await models.redeemcodes.find()

        if (!codes || codes.length === 0) return Embed(msg).setError("Коды не найдены!").send(DELETE_TIMEOUT_MESSAGES);
        const embeds: MessageEmbed[] = [];

        for (let i = 0; i < codes.length; i+=10) {
            const sliced = codes.slice(i, i+10);;
            const texted = sliced.map(code => {
                return `**${code._id}** — ${Currency[code.rewardType].emoji}\`${client.util.formatNumber(code.reward)}\` — Макс. исп. \`${code?.users?.length || 0}/${code.maxCount || "Неограничено"}\` — Дата дст: ${code.validDate ? client.timestamp(code.validDate.getTime(), "d") : "`Неограничено`"}`
            })
            embeds.push(Embed(msg).setTitle("Коды: " + codes.length).setText(texted.join("\n\n")))
        }

        new Pagination({embeds, message: msg, validIds: [msg.author.id]}).createAdvancedPagination()
        
    }
}