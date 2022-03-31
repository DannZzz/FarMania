import ms from "ms";
import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { findOrCreateOne, models } from "../../database/db";
import { DateTime } from "../../structures/DateAndTime";
import { Embed } from "../../structures/Embed";
import { Functions } from "../../structures/Functions";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class Ban extends MessageCommand {
    constructor() {
        super({
            name: "ban",
            description: "ban member",
            developer: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (!args[0]) return Embed(msg).setError("[ID] <ms(Date)>").send(DELETE_TIMEOUT_MESSAGES);
        const userId = args[0];
        var date = ms("10d");
        if (args[1] && ms(args[1])) date = ms(args[1]);

        await findOrCreateOne("users", {findOption: userId});
        await models.users.updateOne({_id: userId}, {$set: {ban: new Date(Date.now() + date)}})
        
        Embed(msg).setSuccess(`Аккаунт был забанен!\nСрок: \`${DateTime.formatTime(DateTime.getTimeData(date, 0), false, Functions.getTimeLang(sd.language))}\``).send();
    }
}