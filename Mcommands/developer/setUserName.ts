import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { Embed } from "../../structures/Embed";

export default class setUserName extends MessageCommand {
    constructor() {
        super({
            name: "set-username",
            description: "set username",
            developer: true,
            hideInHelp: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (!args[0]) return Embed(msg).setError("Укажите имя").send(DELETE_TIMEOUT_MESSAGES)
        client.user.setUsername(args.join(" "));
        Embed(msg).setSuccess("Юзернейм установлен!").send(DELETE_TIMEOUT_MESSAGES);
    }
}