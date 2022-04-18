import { DataResolver, Interaction, Message, MessageEmbed } from "discord.js";
import { colors, DELETE_TIMEOUT_MESSAGES } from "../config";
import { changeMoney, findOrCreateOne } from "../database/db";
import { Currency } from "../docs/currency/Main";
import { Airplane } from "../structures/Airplane/Airplane";
import { Embed } from "../structures/Embed";
import { Event, EventRunOptions } from "../structures/Event";

export default class TrackAirplane extends Event {
    constructor() {
        super({
            name: "interactionCreate"
        })
    }

    async execute({ client, values }: EventRunOptions<Interaction>): Promise<any> {
        const interaction = values[0];
        if (interaction.isButton() && ["AIRPLANEBET", "TAKEAIRPLANEBET"].includes(interaction.customId.split("-")[0])) {
            await interaction.deferUpdate()
            const splitedId = interaction.customId.split("-");
            const bot = await findOrCreateOne("bot", {findOption: "main"});
            const thisGuild = bot.airplanes.find(a => a.guild === interaction.guildId);
            if (!thisGuild) return;

            
            const p = new Airplane(thisGuild.channel);
            if (splitedId[0] === "AIRPLANEBET") {

               
                if (p.hasUser(interaction.user.id)) return interaction.followUp({embeds: [new MessageEmbed().setColor(colors.error).setDescription("Вы уже пассажир самолёта!")], ephemeral: true});
                const user = await findOrCreateOne("users", {findOption: interaction.user.id});
                if (user.dollars < +splitedId[1]) return interaction.followUp({embeds: [new MessageEmbed().setColor(colors.error).setDescription("У вас недостаточно " + Currency.dollars.emoji)], ephemeral: true});
                p.addUser(interaction.user.id, +splitedId[1]);
                await changeMoney("dollars", interaction.user.id, -(+splitedId[1]));
                return interaction.followUp({ephemeral: true, embeds: [new MessageEmbed().setColor(colors.success).setDescription("Вы успешно стали пассажиром самолёта!")]});
            } else {
                if (!p.hasUser(interaction.user.id)) return interaction.followUp({embeds: [new MessageEmbed().setColor(colors.error).setDescription("Вы не пассажир этого самолёта!")], ephemeral: true});
                const thisUser = p.game.users.find(u => u.id === interaction.user.id);
                const rew = thisUser.bet * p.game.thisNumber;
                p.removeUser(interaction.user.id)
                await changeMoney("dollars", interaction.user.id, rew);
                Embed(interaction.message as Message).setSuccess(`**${interaction.user.tag}** запрыгнул(-а) из самолёта забрав ${Currency.dollars.emoji}\`${client.util.formatNumber(rew)}\` (начальная ставка: ${Currency.dollars.emoji}\`${client.util.formatNumber(thisUser.bet)}\`)`).send(DELETE_TIMEOUT_MESSAGES * 2)
            }
        }
        
    }
}