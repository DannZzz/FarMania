import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { Embed } from "../../structures/Embed";

export default class setAvatar extends MessageCommand {
    constructor() {
        super({
            name: "set-avatar",
            description: "set avatar",
            developer: true,
            hideInHelp: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (!args[0]) return Embed(msg).setError("Ссылку на картинку").send(DELETE_TIMEOUT_MESSAGES)
        client.user.setAvatar(args[0]);
        Embed(msg).setSuccess("Аватар установлен!").send(DELETE_TIMEOUT_MESSAGES);

    }
}