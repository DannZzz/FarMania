import { CLIENT_USER_AVATAR_URI } from "../../config";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class setAvatarAndUserName extends MessageCommand {
    constructor() {
        super({
            name: "set-avatar",
            description: "set avatar and username",
            developer: true,
            hideInHelp: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        client.user.setAvatar(CLIENT_USER_AVATAR_URI)
        if (args.length > 0) client.user.setUsername(args.join(" "));
    }
}