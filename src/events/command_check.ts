import { ClientEvents, Message, UserResolvable, Collection } from "discord.js";
import { Event, EventRunOptions } from "../structures/Event";
import { DELETE_TIMEOUT_MESSAGES, DEVELOPER_ID, PREFIX } from "../config";
import { MessageCommand } from "../structures/MessageCommand";
import { findOrCreateOne } from "../database/db";
import { Embed } from "../structures/Embed";
import { TextExp } from "../docs/languages/createText";
import { DateTime } from "../structures/DateAndTime";
import { Functions } from "../structures/Functions";
var prefix: string = PREFIX;
const cooldowns = new Map();
export default class GetCommand extends Event {
    constructor () {
        super({
            name: "messageCreate"
        })
    }
    async execute({client, values}: EventRunOptions<Message>): Promise<any> {
        const message = values[0];
        if (!message.content) return;
        // database
        const sd = await findOrCreateOne("servers", {findOption: message.guild.id});
        prefix = sd.prefix

        const userData = await findOrCreateOne("users", {findOption: message.author.id});
        
        if (!message.content.startsWith(prefix)) return;
        const args = message.content.slice(prefix.length).trim().split(/ /g);
        const cmd = args.shift();
        const commandfile: MessageCommand = client.messageCommands.get(cmd) || client.messageCommands.get(client.messageCommandsAliases.get(cmd));
        
        if (commandfile && !commandfile.disabled && !commandfile.private) {
            if (commandfile.developer && message.author.id !== DEVELOPER_ID) return;

            if (userData.ban && userData.ban > new Date()) {
                return Embed(message).setError(`${TextExp(121, sd.language)}\n${TextExp(122, sd.language)} \`${DateTime.formatTime(DateTime.getTimeData(userData.ban.getTime()), false, Functions.getTimeLang(sd.language))}\``).send(DELETE_TIMEOUT_MESSAGES * 2)
            }
            
            if (!message.member.permissions.has(commandfile.permissions || [])) return // return U dont have enough permissions
            
            if (!cooldowns.has(commandfile.name)) {
                    cooldowns.set(commandfile.name, new Collection());
                }

                const currentTime = Date.now();
                const time_stamps = cooldowns.get(commandfile.name);
                const cooldownAmount = (commandfile.cooldown || 1.5) * 1000;

                if (time_stamps.has(message.author.id)) {
                    const expire = time_stamps.get(message.author.id) + cooldownAmount;
                    if (currentTime < expire) {
                        const time = (expire - currentTime) / 1000;

                        return;
                    }
                }

                time_stamps.set(message.author.id, currentTime);
                setTimeout(() => time_stamps.delete(message.author.id), cooldownAmount);
                commandfile.execute({client, args, msg: message, prefix, methods: "", sd})
        }
    }
}