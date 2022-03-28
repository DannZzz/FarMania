import { Collection } from "discord.js";
import { Embed } from "../../structures/Embed";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class Help extends MessageCommand {
    constructor () {
        super({
            name: "help",
            developer: true,
            description: "help menu"
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        const commands = client.messageCommands as Collection<keyof MessageCommand, MessageCommand>;
        const commandsTexts: string[] = [];

        commands.forEach(command => commandsTexts.push(`**${command.name}** - ${command.description}`));
        Embed(msg).setText(commandsTexts.join("\n")).send();
    }
}