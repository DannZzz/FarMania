import { changeMoney } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import { Embed } from "../../structures/Embed";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class addCoins extends MessageCommand {
    constructor() {
        super({
            name: "add-coins",
            aliases: ["ac"],
            description: "add coins",
            developer: true,
            hideInHelp: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (!args[0]) return Embed(msg).setError("Укажи участника.").send(5000);
        const user = await client.users.fetch(args[0]);
        if (!user) return Embed(msg).setError("Участник не найден!").send(5000);
        if (!args[1] || isNaN(+args[1])) return Embed(msg).setError("Укажи кол-во бабла.").send(5000);
        await changeMoney("coins", user.id, +args[1]);
        return Embed(msg).setSuccess(`Успешно добавлено пацанчику **${user.username}** ${Currency.coins.emoji}\`${client.util.formatNumber(+args[1])}\`.`).send(5000);
    }
}