import { Client, Util } from "client-discord";
import { Guild, Message, MessageButton, MessageEmbed, MessageSelectOptionData, User } from "discord.js";
import ms from "ms";
import { DELETE_TIMEOUT_MESSAGES, MADE_SELL_NUMBERS } from "../config";
import { changeMoney, findOrCreateOne, models } from "../database/db";
import { AnimalData, GameModel, madeData } from "../database/models/GameModel";
import { Animal, AnimalNames } from "../docs/animals/Animal";
import { Animals } from "../docs/animals/Animals_list";
import { calculateMadeCount, Made } from "../docs/animals/Foods";
import { Currency } from "../docs/currency/Main";
import { getRealCost } from "../docs/currency/selling";
import { ButtonEmojis } from "../docs/emojis/emoji";
import Text, { TextExp } from "../docs/languages/createText";
import { Languages } from "../docs/languages/language_list";
import { Embed } from "./Embed";
import { Functions } from "./Functions";
import { InterfaceEdition, Page } from "./InterfaceEdition";

export class FarmInterface {
    data: GameModel
    language: Languages

    /**
     * User `getData`.
     * 
     * @param client client discord
     * @param user User
     * @param guild message guild
     * @param msg message
     */
    constructor(
        private readonly client: Client,
        private readonly user: User,
        private readonly guild: Guild,
        private readonly msg: Message,
    ) {
    }

    async getData() {
        this.data = await findOrCreateOne("games", { findOption: this.user.id });
        this.language = (await findOrCreateOne("servers", { findOption: this.guild.id })).language as Languages
        return this;
    }

    async getAnimalsEmbed() {
        await this.check()

        const animals = this.data.animals as Array<AnimalData>;

        const embed = new MessageEmbed()
            .setColor(this.client.colors.main)
            .setFooter({ text: this.user.tag, iconURL: this.user.displayAvatarURL({ dynamic: true }) });


        const embeddescription: string[] = []
        for (let i of animals) {
            embeddescription.push(`${(Animals[i.name] as Animal).emoji}\`x${Util.formatNumber(i.count)}\` ${(Animals[i.name] as Animal).gives ? `--> ${Made[(Animals[i.name] as Animal).gives].emoji}\`x${calculateMadeCount(i.name, i.madeGot, i.count)}\`` : ""}`);
        }


        embed.setDescription(await FarmInterface.moneyInterface(this.user.id) + " — " + `✨\`${this.client.util.formatNumber(Functions.calculateReputation(this.data.animals))}\`` + "\n" + await Text(1, this.guild.id) + "\n\n" + embeddescription.join("\n"))


        return embed

    }

    async getAnimalsButtons() {
        const animals = this.data.animals as AnimalData[];

        const a = this;
        const buttons = []
        buttons.push(
            {
                button: new MessageButton()
                    .setCustomId("getAnimals")
                    .setStyle("SECONDARY")
                    .setLabel(TextExp(24, this.language)),
                nextPage: true,
                async action(): Promise<Page<MessageEmbed>> {
                    return {
                        menus: async () => {
                            const options: MessageSelectOptionData[] = [];
                            for (let i of animals) {
                                const count = i.count
                                const animal = Animals[i.name] as Animal;
                                options.push(
                                    {
                                        value: `${i.name}-${count}`,
                                        emoji: animal.emoji,
                                        label: `x${a.client.util.formatNumber(count)}`
                                    }
                                )
                            }
                            const menus = InterfaceEdition.makeSelectMenusFromOptions(options);

                            return menus.map(menu => {
                                return {
                                    menu,
                                    nextPage: true,
                                    async action(name) {
                                        return await a.createAnimalData(name.split("-")[0] as AnimalNames, +name.split("-")[1])
                                    }
                                }
                            })
                        },
                        async embed() {
                            return await (await a.getData()).getAnimalsEmbed()
                        },
                        description: "a",
                        buttonLabel: "a",
                        buttonType: "SECONDARY",
                        type: "Group",
                        customId: "lko"
                    }
                }
            }
        )
        buttons.unshift(
            {
                button: new MessageButton()
                    .setCustomId("collectall")
                    .setStyle("SUCCESS")
                    .setEmoji("🗑")
                    .setDisabled(this.data.animals?.length >= 1 ? false : true)
                    .setLabel(TextExp(31, this.language)),
                async action() {

                    const data = await findOrCreateOne("games", { findOption: a.user.id });
                    const animals = data.animals as AnimalData[];
                    
                    for (let i of animals) {
                        const count = i.count;
                        const anim = Animals[i.name] as Animal;
                        if (!anim.gives || Animals[i.name].makingTimeAndLost && Date.now() - i.madeGot.getTime() < ms(Animals[i.name].makingTimeAndLost)) continue;
                        const newD = await findOrCreateOne("games", { findOption: a.user.id });
                        const index = newD.madeData.findIndex(a => a.name === anim.gives);
                        const toAdd = calculateMadeCount(i.name, i.madeGot, count);

                        if (index >= 0) {
                            await models.games.updateOne({ _id: a.user.id }, { $inc: { [`madeData.${index}.count`]: toAdd } })
                        } else {
                            await models.games.updateOne({ _id: a.user.id }, { $push: { madeData: { name: anim.gives, count: toAdd } } })

                        }
                    }
                    const newAnimals = [...data.animals]
                    newAnimals.forEach(d => {
                        if (Animals[d.name].makingTimeAndLost && Date.now() - d.madeGot.getTime() >= ms(Animals[d.name].makingTimeAndLost)) d.madeGot = new Date()
                    });
                    await models.games.updateOne({ _id: a.user.id }, { $set: { animals: newAnimals } });
                    return Embed(a.msg).setSuccess(TextExp(32, a.language)).send(DELETE_TIMEOUT_MESSAGES);
                }
            },
            {
                button: new MessageButton()
                    .setCustomId("goToStorage")
                    .setEmoji("🏚")
                    .setStyle("PRIMARY"),
                nextPage: true,
                async action(): Promise<Page<MessageEmbed>> {
                    return {
                        async embed() {
                            const d = await findOrCreateOne("games", { findOption: a.user.id });
                            const mainEmb = Embed(a.msg).setTitle(`🏚 | ${TextExp(55, a.language)}`).setText(TextExp(56, a.language));
                            const texts: string[] = []
                            let i: madeData
                            for (i of d.madeData as Array<madeData>) {
                                texts.push(`${Made[i.name].emoji}\`x${a.client.util.formatNumber(i.count)}\``)
                            }
                            if (texts.length > 0) mainEmb.setText(texts.join("\n"));
                            return mainEmb as MessageEmbed;
                        },
                        description: "an",
                        buttonLabel: 'ad',
                        buttonType: "DANGER",
                        type: "Group",
                        customId: "lol",
                        menus: a.createItemData.bind(a)
                    }
                }
            }
        )

        return buttons
    }

    async createItemData() {
        const a = this;
        const model = await findOrCreateOne("games", { findOption: a.user.id });
        const arr: MessageSelectOptionData[] = [];

        for (let i of model.madeData) {
            const d = Made[i.name];
            arr.push(
                {
                    value: `made-${i.name}`,
                    emoji: d.emoji,
                    label: `x${i.count}`
                }
            )
        }
        const menus = InterfaceEdition.makeSelectMenusFromOptions(arr);
        return menus.map(m => {
            return {
                menu: m,
                nextPage: true,
                async action(customId: string): Promise < Page < MessageEmbed >> {
                    const name = customId.split("-")[1]
                    return {
                        async embed() {
                            const model = await findOrCreateOne("games", { findOption: a.user.id });
                            const thiss = model.madeData.find(obj => obj.name === name);

                            const d = Made[name];
                            return Embed(a.msg).setText(`${await FarmInterface.moneyInterface(a.user.id)}\n\n${TextExp(4, a.language)} ${d.emoji}\`x${(!thiss || thiss.count === 0) ? 0 : Math.round(thiss.count)}\`\n\n${d.emoji}\`x1\` --> ${Currency[d.cost.type].emoji}\`${a.client.util.formatNumber(d.cost.amount)}\``).setTitle(TextExp(3, a.language)) as MessageEmbed;
                        },
                        description: "an",
                        buttonLabel: 'ad',
                        buttonType: "DANGER",
                        type: "Group",
                        customId: "lol",
                        buttons: async () => {
                            return await Promise.all(MADE_SELL_NUMBERS.map(async number => {
                                const md = await findOrCreateOne("games", { findOption: a.user.id });
                                var l = md.madeData.find(obh => obh.name === name);
                                return {
                                    button: new MessageButton()
                                        .setCustomId(`SELL-${number}`)
                                        .setDisabled((l.count >= number && l.count !== 0) ? false : true)
                                        .setStyle("SECONDARY")
                                        .setLabel(`${TextExp(2, a.language)} ${number === 0 ? TextExp(120, a.language) : `x${number}`}`),
                                    async action(msg: Message): Promise<any> {
                                        const data = await findOrCreateOne("games", { findOption: a.user.id })
                                        const item = data.madeData.find(a => a.name === l.name);
                                        const d = Made[l.name];
                                        if (number === 0) number = item.count;
                                        const index = data.madeData.findIndex(a => a.name === l.name);
                                        if (!item || item.count < number) return await Embed(msg).setTitle(TextExp(5, a.language)).setError(TextExp(6, a.language)).send(DELETE_TIMEOUT_MESSAGES);

                                        await Promise.all([
                                            models.games.updateOne({ _id: a.user.id }, { $inc: { [`madeData.${index}.count`]: -number } }),
                                            changeMoney(d.cost.type, a.user.id, d.cost.amount * number)
                                        ])
                                        return await Embed(msg).setTitle(TextExp(7, a.language)).setSuccess(`${TextExp(8, a.language)} ${Currency[d.cost.type].emoji}\`${Util.formatNumber(Math.round(d.cost.amount * number))}\``).send(DELETE_TIMEOUT_MESSAGES);
                                    },

                                }
                            }))
                        }
                    }
                }
            }
        })

    }

    async createAnimalData(name: AnimalNames, count: number): Promise<Page<MessageEmbed>> {
        const a = this;
        async function get() {
            return [1, 10, 100, 1000].map(number => {
                return {
                    button: new MessageButton()
                        .setCustomId(`SELL-${number}`)
                        .setDisabled(count >= number ? false : true)
                        .setStyle("SECONDARY")
                        .setLabel(`${TextExp(2, a.language)} x${number}`),
                    async action(msg: Message): Promise<any> {
                        const count = await FarmInterface.getAnimalData(a.user.id, name);
                        const data = await findOrCreateOne("games", { findOption: a.user.id })
                        if (count < number) return await Embed(msg).setTitle(TextExp(5, a.language)).setError(TextExp(6, a.language)).send(DELETE_TIMEOUT_MESSAGES);
                        const newArray = FarmInterface.removeSpecNumberOfElements(data.animals, name, number);

                        await Promise.all([
                            models.games.updateOne({ _id: a.user.id }, { $set: { animals: newArray } }),
                            changeMoney("coins", a.user.id, getRealCost(Animals[name].cost.type, Animals[name].cost.amount, number))
                        ])
                        return await Embed(msg).setTitle(TextExp(7, a.language)).setSuccess(`${TextExp(8, a.language)} ${Currency.coins.emoji}\`${Util.formatNumber(Math.round(getRealCost(Animals[name].cost.type, Animals[name].cost.amount, number)))}\``).send(DELETE_TIMEOUT_MESSAGES);
                    },

                }
            })
        }

        const color = this.client.colors.main
        return {
            async embed() {
                const mydata = await findOrCreateOne("games", { findOption: a.user.id });
                const count = await FarmInterface.getAnimalData(a.user.id, name);
                return new MessageEmbed().setColor(color).setDescription(`${await FarmInterface.moneyInterface(a.user.id)}\n\n${TextExp(4, a.language)} ${Animals[name].emoji} \`${Util.formatNumber(count)}\`\n\n\`x1\` ${Animals[name].emoji} --> ${Currency["coins"].emoji} \`${Util.formatNumber(getRealCost(Animals[name].cost.type, Animals[name].cost.amount))}\``).setTitle(TextExp(3, a.language))
            },
            buttonLabel: TextExp(9, this.language),
            buttonType: "PRIMARY",
            buttons: async () => await get(),
            customId: "ANIMAL-" + name,
            description: "Дескриптион",
            emoji: "💰",
            type: "Group",
        }
    }


    static async moneyInterface(userId: string, chips: boolean = false) {
        const user = await findOrCreateOne("users", { findOption: userId });
        return `${Currency.coins.emoji}\`${Util.formatNumber(Math.round(user.coins))}\`  ${Currency.dollars.emoji}\`${Util.formatNumber(Math.round(user.dollars))}\`  ${chips ? `${Currency.chips.emoji}\`${Util.formatNumber(Math.round(user.chips))}\`` : ""}`
    }

    static async getAnimalData(userId: string, name: AnimalNames): Promise<number> {
        const usersgame = await findOrCreateOne("games", { findOption: userId });
        return (usersgame.animals as Array<AnimalData>).find(animal => animal.name === name)?.count || 0;
    }

    static removeSpecNumberOfElements<T extends AnimalData>(array: T[], data: string, count?: number): T[] {
        const filtered = array.find(e => e.name === data);
        const out = array.filter(e => e.name !== data);
        if (!count || filtered.count < count) return out;
        filtered.count -= count;
        if (filtered.count <= 0) return out
        out.push(filtered)
        return out;
    }

    private async check() {
        if (!this.data.animals || this.data.animals.length === 0) {
            await models.games.updateOne({ _id: this.user.id }, { $set: { madeGot: null } });
            this.data = await findOrCreateOne("games", { findOption: this.user.id });
        } else if (this.data.animals?.length > 0 && !this.data.madeGot) {
            await models.games.updateOne({ _id: this.user.id }, { $set: { madeGot: new Date() } });
            this.data = await findOrCreateOne("games", { findOption: this.user.id });
        }
    }

    /**
     * 
     * @param userId user id
     * @param name animal name
     * @param count count to change
     */
    static async changeAnimalCountInData(userId: string, name: AnimalNames, count: number) {
        const d = await findOrCreateOne("games", { findOption: userId });
        const animal = d.animals.find(an => an.name === name);
        const index = d.animals.findIndex(an => an.name === name);
        if (animal) {
            await models.games.updateOne({ _id: userId }, { $inc: { [`animals.${index}.count`]: Math.round(count) } });
        } else {
            await models.games.updateOne({ _id: userId }, {
                $push: {
                    animals: {
                        name,
                        madeGot: new Date(),
                        count: Math.round(count)
                    }
                }
            });
        }
    }
}