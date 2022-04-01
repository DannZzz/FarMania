import { MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { findOrCreateOne, models } from "../../database/db";
import { Animal } from "../../docs/animals/Animal";
import { Animals } from "../../docs/animals/Animals_list";
import { Embed } from "../../structures/Embed";
import { InterfaceEdition } from "../../structures/InterfaceEdition";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class ChangeAnimals extends MessageCommand {
    constructor () {
        super({
            name: "change-animals",
            aliases: ["cha"],
            description: "change animals from user",
            developer: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {

        if (!args[0] || !args[1] || isNaN(+args[1])) return Embed(msg).setError("[ID] <count>").send(DELETE_TIMEOUT_MESSAGES);

        var id = args[0];
        var count = Math.round(+args[1]);

        const user = await client.users.fetch(id);
        if (!user) return Embed(msg).setError("Участник не найден!").send(DELETE_TIMEOUT_MESSAGES);
        
        const options: MessageSelectOptionData[] = [];

        for (let i in Animals) {
            const a = Animals[i] as Animal;
            options.push({
                value: a.name,
                label: a.name
            })
        }

        const menus = InterfaceEdition.makeSelectMenusFromOptions(options);

        const ids = menus.map(m => m.customId);

        const m = await Embed(msg).setText("Выберите животного...").send(undefined, {components: InterfaceEdition.createRows(menus)})
        
        const c = m.createMessageComponentCollector({
            filter: i => i.user.id === msg.author.id && ids.includes(i.customId),
            time: 30000,
            max: 1
        })

        c.on("end", () => {
            m.delete();
        })
        
        c.on("collect", async (i: SelectMenuInteraction) => {
            c.stop();
            const value = i.values[0];

            const userData = await findOrCreateOne("games", {findOption: id});
            const index = userData.animals.findIndex(an => an.name === value);
            if (index === -1) {
                await models.games.updateOne({_id: id}, {$push: {animals: {name: value, count} }});
            } else {
                await models.games.updateOne({_id: id}, {$inc: {[`animals.${index}.count`]: count}})
            }

            Embed(msg).setSuccess(`Участнику ${user.tag} добавлено ${Animals[value].emoji}\`${client.util.formatNumber(count)}\``).send(DELETE_TIMEOUT_MESSAGES * 2)
            
        })
    }
}