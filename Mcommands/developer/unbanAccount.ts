import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { findOrCreateOne, models } from "../../database/db";
import { DateTime } from "../../structures/DateAndTime";
import { Embed } from "../../structures/Embed";
import { Functions } from "../../structures/Functions";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class UnBan extends MessageCommand {
    constructor() {
        super({
            name: "unban",
            description: "unban member",
            developer: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (!args[0]) return Embed(msg).setError("[ID]").send(DELETE_TIMEOUT_MESSAGES);
        const userId = args[0];
        const user = await findOrCreateOne("users", {findOption: userId, denyCreation: true});
        if (!user || !user.ban || user.ban < new Date()) return Embed(msg).setError("Этот пользователь и не забанен!").send(DELETE_TIMEOUT_MESSAGES);
        await models.users.updateOne({_id: userId}, {$set: {ban: null}});
        Embed(msg).setSuccess(`Аккаунт был разбанен!`).send();
    }
}