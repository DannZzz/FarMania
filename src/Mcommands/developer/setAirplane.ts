import { TextChannel } from "discord.js";
import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { findOrCreateOne, models } from "../../database/db";
import { AirplaneGame } from "../../structures/Airplane/Game";
import { Embed } from "../../structures/Embed";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class SetAirplaneCommand extends MessageCommand {
    constructor () {
        super({
            name: "setup-airplane",
            developer: true,
            description: "setup ne airplane"
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        const bot = await findOrCreateOne("bot", {findOption: "main"});
        var channel = msg.channel as TextChannel;
        if (args[0]) {
            channel = (msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]) || channel) as TextChannel;
        }

        if (args[1] && args[1] === "delete") {
            const index = bot.airplanes.find(p => p.guild === msg.guildId);
            if (index) {
                const newPlanes = client.util.remove(bot.airplanes, {elements: [index], indexes: []});
                // console.log(index);
                // console.log(newPlanes)
                await models.bot.updateOne({_id: "main"}, {$set: {airplanes: newPlanes }})
                await new AirplaneGame(client).updateMessages();

                Embed(msg).setSuccess('Успешно удалено!').send(DELETE_TIMEOUT_MESSAGES * 2);
                return;
            } else {
                return
            }
        }
        
        const index = bot.airplanes.findIndex(p => p.guild === msg.guildId);
        if (index === -1) {
            await models.bot.updateOne({_id: "main"}, {$push: {airplanes: {guild: msg.guildId, channel: channel.id, message: undefined} }})
        } else {
            await models.bot.updateOne({_id: "main"}, {$set: {[`airplanes.${index}.channel`]: channel.id, [`airplanes.${index}.undefined`]: undefined}})
        }

        await new AirplaneGame(client).updateMessages();

        Embed(msg).setSuccess('Успешно установлено!').send(DELETE_TIMEOUT_MESSAGES * 2)
        
    }
}