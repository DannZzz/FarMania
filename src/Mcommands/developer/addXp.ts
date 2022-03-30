import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { changeXp } from "../../database/db";
import { Embed } from "../../structures/Embed";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class AddXP extends MessageCommand {
    constructor () {
        super({
            name: "add-xp",
            aliases: ['axp'],
            description: "add xp",
            developer: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (!args[0]) return Embed(msg).setError("[ID] <amount of xp>").send(DELETE_TIMEOUT_MESSAGES);
        if (!args[1] || isNaN(+args[1])) return Embed(msg).setError("Укажите кол-во").send(DELETE_TIMEOUT_MESSAGES);

        const user = await client.users.fetch(args[0]);
        if (!user) return Embed(msg).setError("Участник не найден!").send(DELETE_TIMEOUT_MESSAGES);

        await changeXp(args[0], +args[1]);
        Embed(msg).setSuccess(`Успешно добавлено пацанчику **${user.username}** \`${client.util.formatNumber(+args[1])}xp\``).send(DELETE_TIMEOUT_MESSAGES);
    }
}