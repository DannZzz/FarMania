import { DELETE_TIMEOUT_MESSAGES, TIME_TO_CHANGE_PARAMETER } from "../../config";
import { changeMoney, hasMoney, translations } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import { TextExp } from "../../docs/languages/createText";
import { Embed } from "../../structures/Embed";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { delay } from "../category/start";

export const TranslationListener = new Set();

export default class TranslateMoney extends MessageCommand {
    constructor () {
        super({
            name: "translate-money",
            aliases: ["tr"],
            description: "transtale money function",
            private: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (TranslationListener.has(msg.author.id)) return;
        const Translation = await translations(msg.author.id, true);
        TranslationListener.add(msg.author.id);
        const m1 = await Embed(msg).setText(`${TextExp(132, sd.language)} ${Currency.dollars.emoji}\`${Translation.sent}/${Translation.available}\`\n\n${TextExp(131, sd.language) + "\n\n" + "`@Dann#2523 50\n418794163321789 150`"}`).send();

        const cl = msg.channel.createMessageCollector({
            filter: m => m.author.id === msg.author.id,
            time: TIME_TO_CHANGE_PARAMETER
        });
        var b = false;
        cl.on("end", () => {
            TranslationListener.delete(msg.author.id);
            m1.delete();
            if (!b) Embed(msg).setError(TextExp(50, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
        })

        cl.on("collect", async (m): Promise<any> => {
            b = true;
            cl.stop();
            if (!m.content) return Embed(msg).setError(TextExp(133, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
            const _args = m.content.trim().split(/ +/g);
            
            if (!_args[0]) return Embed(msg).setError(TextExp(131, sd.language) + "\n\n" + "`@Dann#2523 50\n418794163321789 150`").send(DELETE_TIMEOUT_MESSAGES);
            const member = m.mentions.members.first() || (await client.users.fetch(_args[0])); 

            if (!member) return Embed(msg).setError(TextExp(134, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
            
            if (!_args[1] || isNaN(+_args[1]) || +_args[1] < 1) return Embed(msg).setError(TextExp(131, sd.language) + "\n\n" + "`@Dann#2523 50\n418794163321789 150`").send(DELETE_TIMEOUT_MESSAGES);
            const amount = Math.round(+_args[1]);
            await delay(700)
            if (!(await hasMoney(msg.author.id, amount))) return Embed(msg).setError(`${TextExp(25, sd.language)} ${Currency.dollars.emoji}`).send(DELETE_TIMEOUT_MESSAGES);
            const data = await translations(msg.author.id, true);
            if (data.sent + amount > data.available) return Embed(msg).setTitle(TextExp(5, sd.language)).setError(TextExp(135, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
            await Promise.all([
                changeMoney("dollars", msg.author.id, -amount),
                changeMoney("dollars", member.id, amount),
                translations(msg.author.id, {to: member.id, amount, date: new Date()})
            ])
            Embed(msg).setSuccess(TextExp(136, sd.language) + `\n${Currency.dollars.emoji}\`${client.util.formatNumber(amount)}\` --> **${("tag" in member) ? member.tag : member.user.tag}**`).send();
        })
    }
}
