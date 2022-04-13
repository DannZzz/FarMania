import { ButtonInteraction, DataResolver, Interaction, Message, MessageButton, MessageEmbed, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from "discord.js"
import { colors } from "../config";
import { changeMoney, findOrCreateOne } from "../database/db";
import { Currency } from "../docs/currency/Main";
import { Event, EventRunOptions } from "../structures/Event"
import { FarmInterface } from "../structures/FarmInterface";
import { InterfaceEdition } from "../structures/InterfaceEdition";
import { Roulette } from "../structures/Roulette/Roulette";
import { RouletteMenu } from "../structures/Roulette/RouletteMenu";
export const RouletteInteractionListener = new Set<string>();

export default class TrackRouletteBet extends Event {
    constructor() {
        super({
            name: "interactionCreate"
        })
    }

    async execute({ client, values }: EventRunOptions<Interaction>): Promise<any> {
        const interaction = values[0];
        if (interaction.isButton() && interaction.customId.split("-")[0] === "MakeNewRoulleteBet") {
            const bet = +interaction.customId.split("-")[1]
            if (RouletteInteractionListener.has(interaction.user.id)) return interaction.deferUpdate()
            await interaction.deferReply({"ephemeral": true, fetchReply: true});
            const data = await findOrCreateOne("users", {findOption: interaction.user.id});
            if (data.dollars < bet) return interaction.followUp({embeds: [new MessageEmbed().setColor(colors.error).setDescription("У вас недостаточно " + Currency.dollars.emoji)], ephemeral: true})
            
            RouletteInteractionListener.add(interaction.user.id);

            const embed = new MessageEmbed()
                .setColor(colors.main)
                .setTitle("Выберите тип ставки!")
                .setDescription(await FarmInterface.moneyInterface(interaction.user.id));

            const a0to18: MessageSelectOptionData[] = [];
            const a19to36: MessageSelectOptionData[] = [];

            for (let i = 0; i <= 36; i++) {
                const d: MessageSelectOptionData = {
                    value: i + "",
                    label: i + "",
                }
                if (i <= 18) {
                    a0to18.push(d)
                } else {
                    a19to36.push(d)
                }
            }

            const buttons = [
                new MessageButton()
                    .setCustomId(`${interaction.user.id}_black`)
                    .setStyle("PRIMARY")
                    .setLabel("Чёрный"),
                new MessageButton()
                    .setCustomId(`${interaction.user.id}_red`)
                    .setStyle("DANGER")
                    .setLabel("Красный"),
                new MessageButton()
                    .setCustomId(`${interaction.user.id}_odd`)
                    .setStyle("SECONDARY")
                    .setLabel("Нечётное"),
                new MessageButton()
                    .setCustomId(`${interaction.user.id}_even`)
                    .setStyle("SECONDARY")
                    .setLabel("Чётное"),
                new MessageButton()
                    .setCustomId(`${interaction.user.id}_[1, 12]`)
                    .setStyle("SUCCESS")
                    .setLabel("1-12"),
                new MessageButton()
                    .setCustomId(`${interaction.user.id}_[13, 24]`)
                    .setStyle("SUCCESS")
                    .setLabel("13-24"),
                new MessageButton()
                    .setCustomId(`${interaction.user.id}_[25, 36]`)
                    .setStyle("SUCCESS")
                    .setLabel("25-36"),
                new MessageSelectMenu()
                    .setCustomId(`${interaction.user.id}_0-18`)
                    .setPlaceholder("Числа 0-18")
                    .setOptions(a0to18),
                new MessageSelectMenu()
                    .setCustomId(`${interaction.user.id}_19-36`)
                    .setPlaceholder("Числа 19-36")
                    .setOptions(a19to36)
            ];

            const msg = await interaction.editReply({embeds: [embed], components: InterfaceEdition.createRows(buttons)}) as Message;
            // console.log(msg)
            const c = msg.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id && buttons.map(b => b.customId).includes(i.customId),
                time: 30 * 1000 
            });

            c.on("end", () => {
                RouletteInteractionListener.delete(interaction.user.id)
                interaction.editReply({components: InterfaceEdition.createRows(buttons)})
            });

            c.on("collect", async (i: ButtonInteraction | SelectMenuInteraction): Promise<any> => {
                c.stop()
                await i.deferUpdate()
                const data = await findOrCreateOne("users", {findOption: interaction.user.id});
                if (data.dollars < bet) return interaction.editReply({embeds: [new MessageEmbed().setColor(colors.error).setDescription("У вас недостаточно " + Currency.dollars.emoji)], components: []});
                await changeMoney("dollars", interaction.user.id, -bet)
                if (i.isButton()) {
                    const message = await (new RouletteMenu(client)).getMessage();
                    const roulette = new Roulette(message.channelId);
                    roulette.addUser({
                        id: interaction.user.id,
                        bet,
                        betType: i.customId.split("_")[1].startsWith("[") ? eval(i.customId.split("_")[1]) : i.customId.split("_")[1]
                    })
                    
                    const game = new RouletteMenu(client);
                    game.startGame(message)
                    await game.editMessage(message)
                } else {
                    const message = await (new RouletteMenu(client)).getMessage();
                    const roulette = new Roulette(message.channelId);
                    roulette.addUser({
                        id: interaction.user.id,
                        bet,
                        betType: +i.values[0]
                    })
                    
                    const game = new RouletteMenu(client);
                    game.startGame(message)
                    await game.editMessage(message)
                }
                interaction.editReply({embeds: [new MessageEmbed().setColor(colors.success).setTitle("Ставка успешно сделана!")], components: []});
            })
            
        }
    }
}