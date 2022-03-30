import { Client } from "client-discord";
import { Message, MessageButton, MessageEmbed, MessageEvent, MessageSelectOptionData, User } from "discord.js";
import { ServerModel } from "../database/models/ServerModel";
import { InterfaceEdition, Page } from "./InterfaceEdition";
import { Embed } from "../structures/Embed";
import Text, { TextExp } from "../docs/languages/createText";
import { Animals } from "../docs/animals/Animals_list";
import { Animal } from "../docs/animals/Animal";
import { Currency, CurrencyType } from "../docs/currency/Main";
import { changeMoney, findOrCreateOne, models } from "../database/db";
import { calculateSpace } from "../docs/levels/space";
import { BUY_ANIMALS_X, COINS_TO_DOLLARS, CREDITS, DailyGiftsAdding, DELETE_TIMEOUT_MESSAGES, DONATE_URLS, ERROR_EMOJI, OneDay, PREFIX, SUCCESS_EMOJI } from "../config";
import { FarmInterface } from "./FarmInterface";
import { DateTime } from "./DateAndTime";
import { Functions } from "./Functions";
import { stripIndents } from "common-tags";
import { Made } from "../docs/animals/Foods";
import ms from "ms";
import { getRealCost } from "../docs/currency/selling";
import { findLevel } from "../docs/levels/levels";

export class ShopInterface {
    private user: User;
    constructor(
        readonly client: Client,
        readonly msg: Message,
        readonly sd: ServerModel
    ) {
        this.user = msg.author;
    }

    async main(): Promise<Page<MessageEmbed>> {
        const a = this;
        return {
            async embed() {
                const myDataGame = await findOrCreateOne("games", { findOption: a.user.id });
                const spaces = calculateSpace(myDataGame.spaceLevel, myDataGame.animals);

                return Embed(a.msg).setText(`📐\`${spaces.space}/${spaces.validSpace}\` | ${await FarmInterface.moneyInterface(a.user.id)}\n\n` + TextExp(21, a.sd.language)) as MessageEmbed
            },
            buttonLabel: TextExp(22, a.sd.language),
            buttonType: "PRIMARY",
            emoji: "🛒",
            description: TextExp(23, a.sd.language),
            customId: "shops",
            type: "Group",
            buttons: async () => [
                {
                    button: new MessageButton()
                        .setCustomId("animalsshop")
                        .setEmoji("🐮")
                        .setLabel(TextExp(24, a.sd.language))
                        .setStyle("PRIMARY"),
                    nextPage: true,
                    async action(msg) {

                        const arr: string[][] = [];
                        for (let i in Animals) {
                            const an = Animals[i] as Animal;
                            arr.push([`${an.emoji}\`x1\` — ${an.special ? TextExp(93, a.sd.language) : `${Currency[an.cost.type].emoji}\`${a.client.util.formatNumber(an.cost.amount)}\``}`]);

                        }


                        return {
                            async embed() {
                                const mydata = await findOrCreateOne("games", { findOption: a.user.id });
                                const spaces = calculateSpace(mydata.spaceLevel, mydata.animals);
                                const emb = Embed(a.msg).setTitle(`🐮 | ${TextExp(24, a.sd.language)}`).setText(`📐\`${spaces.space}/${spaces.validSpace}\` | ${await FarmInterface.moneyInterface(a.user.id)}\n\n` + TextExp(1, a.sd.language) + "\n\n" + arr.join("\n"))
                                return emb as MessageEmbed;
                            },

                            menus: async () => {
                                const options: MessageSelectOptionData[] = [];
                                let num = 1
                                for (let i in Animals) {
                                    const an = Animals[i] as Animal;
                                    options.push(
                                        {
                                            value: an.name,
                                            label: `✨ ${a.client.util.formatNumber(an.reputation)}`,
                                            emoji: an.emoji
                                        }
                                    )
                                }

                                const menus = InterfaceEdition.makeSelectMenusFromOptions(options);

                                return menus.map(m => {
                                    return {
                                        menu: m,
                                        nextPage: true,
                                        action: async (i): Promise<Page<MessageEmbed>> => {
                                            const anim = Animals[i] as Animal

                                            return {
                                                async embed() {
                                                    const data = await findOrCreateOne("games", { findOption: a.user.id });
                                                    const space = calculateSpace(data.spaceLevel, data.animals);
                                                    return Embed(a.msg).setTitle(`${TextExp(35, a.sd.language)}: ${anim.emoji}`)
                                                        .setText(stripIndents`
                                                        ${await FarmInterface.moneyInterface(a.user.id)} — 📐\`${a.client.util.formatNumber(space.space)}/${a.client.util.formatNumber(space.validSpace)}\` — ✨\`${a.client.util.formatNumber(Functions.calculateReputation(data.animals))}\`

                                                        ${anim.needLevel ? `${TextExp(125, a.sd.language)}: ⭐\`${a.client.util.formatNumber(anim.needLevel)}\`` : ""}
                                                        ${anim.special ? SUCCESS_EMOJI : ERROR_EMOJI} ${TextExp(94, a.sd.language)}
                                                        ${TextExp(68, a.sd.language)} 📐\`${a.client.util.formatNumber(anim.spaceTake)}\`
                                                        ${TextExp(18, a.sd.language)} ${Currency[anim.cost.type].emoji}\`${a.client.util.formatNumber(anim.cost.amount)}\`
                                                        ${TextExp(43, a.sd.language)} ${Currency.coins.emoji}\`${a.client.util.formatNumber(getRealCost(anim.cost.type, anim.cost.amount))}\`
                                                        ${TextExp(61, a.sd.language)}: ✨\`${a.client.util.formatNumber(anim.reputation)}\`
                                                        ${!anim.gives ? "" :`${TextExp(36, a.sd.language)} ${Made[anim.gives].emoji} --> ${Currency[Made[anim.gives].cost.type].emoji}\`${a.client.util.formatNumber(Made[anim.gives].cost.amount)}\`
                                                        ${TextExp(37, a.sd.language)} \`${DateTime.formatTime(DateTime.getTimeData(ms(anim.makingTimeAndLost), 0), false, Functions.getTimeLang(a.sd.language))}\``}`) as MessageEmbed;
                                                },
                                                customId: "q",
                                                buttonLabel: "a",
                                                buttonType: "DANGER",
                                                type: "Group",
                                                description: "lol",
                                                async buttons() {
                                                    const data = await findOrCreateOne("users", { findOption: a.user.id });
                                                    const allow = (!anim.special && anim.cost.amount <= data[anim.cost.type])
                                                    const buttons = BUY_ANIMALS_X.map(number => {
                                                        return {
                                                            button: new MessageButton()
                                                                .setCustomId("BUYANIMAL-" + number)
                                                                .setLabel(`${TextExp(30, a.sd.language)} x${a.client.util.formatNumber(Math.round(number))}`)
                                                                .setStyle(allow ? "SUCCESS" : "DANGER")
                                                                .setDisabled(allow ? false : true),
                                                            async action() {
                                                                const myData = await findOrCreateOne("users", { findOption: a.user.id });
                                                                const myDataGame = await findOrCreateOne("games", { findOption: a.user.id });
                                                                const level = findLevel(myData.xp || 0);
                                                                if (anim.needLevel && anim.needLevel > level.currentLevel) return Embed(msg).setError(TextExp(130, a.sd.language) + ` **${anim.needLevel}**`).send(DELETE_TIMEOUT_MESSAGES);
                                                                const spaces = calculateSpace(myDataGame.spaceLevel, myDataGame.animals);
                                                                if (spaces.space + (anim.spaceTake * number) > spaces.validSpace) return Embed(a.msg).setError(TextExp(25, a.sd.language) + " " + TextExp(17, a.sd.language) + ".").send(DELETE_TIMEOUT_MESSAGES);
                                                                if ((anim.cost.amount * number) > myData[anim.cost.type]) return Embed(a.msg).setError(TextExp(6, a.sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                                                await Promise.all([
                                                                    FarmInterface.changeAnimalCountInData(a.user.id, anim.name, number),
                                                                    changeMoney(anim.cost.type, a.user.id, -(anim.cost.amount * number))
                                                                ])
                                                                return Embed(a.msg).setSuccess(TextExp(26, a.sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                                            }
                                                        }

                                                    });
                                                    return buttons;
                                                }
                                            }
                                        }
                                    }
                                })
                            },
                            buttonLabel: "a",
                            buttonType: "SECONDARY",
                            type: 'Group',
                            description: "asd",
                            customId: "shop_animals",

                        } as Page<MessageEmbed>
                    }
                },
                {
                    button: new MessageButton()
                        .setCustomId("creaditsshop")
                        .setStyle("PRIMARY")
                        .setEmoji("💰")
                        .setLabel(TextExp(28, a.sd.language)),
                    async action() {
                        return {
                            async embed() {
                                const strings = COINS_TO_DOLLARS.map(obj => {
                                    return `${Currency.dollars.emoji}\`${a.client.util.formatNumber(obj.cost)}\` --> ${Currency.coins.emoji}\`${a.client.util.formatNumber(obj.amount)}\``;
                                });

                                return Embed(a.msg).setTitle(`💰 | ${TextExp(28, a.sd.language)}`).setText(await FarmInterface.moneyInterface(a.user.id) + "\n\n" + strings.join("\n\n")) as MessageEmbed;
                            },
                            buttonLabel: "c",
                            buttonType: "PRIMARY",
                            customId: "creadits",
                            type: "Group",
                            description: "credits buy",
                            nextPage: {
                                async embed() {
                                    const strings = CREDITS.map(obj => {
                                        return `\`$${a.client.util.formatNumber(obj.onDollars)}\` --> ${Currency.dollars.emoji}\`${a.client.util.formatNumber(obj.amount)}\``
                                    })
                                    return Embed(a.msg).setTitle(`💰 | ${TextExp(28, a.sd.language)}`).setText(TextExp(29, a.sd.language) + "\n\n" + strings.join("\n\n")) as MessageEmbed;
                                },
                                buttonLabel: TextExp(30, a.sd.language),
                                buttonType: "PRIMARY",
                                emoji: Currency.dollars.emoji,
                                description: "anyDesc",
                                customId: "buyDollars",
                                type: "Group",
                                buttons: async () => [{
                                    button: new MessageButton()
                                        .setStyle("LINK")
                                        .setURL(DONATE_URLS[a.sd.language] || DONATE_URLS.ru)
                                        .setEmoji(Currency.dollars.emoji)
                                        .setLabel(TextExp(30, a.sd.language)),
                                    async action() { }
                                }]
                            },
                            buttons: async () => {
                                const myD = await findOrCreateOne("users", {findOption: a.user.id});
                                return [...COINS_TO_DOLLARS.map(obj => {
                                    return {
                                        button: new MessageButton()
                                            .setStyle("SECONDARY")
                                            .setEmoji(Currency.coins.emoji)
                                            .setDisabled(myD.dollars < obj.cost ? true : false)
                                            .setLabel(a.client.util.formatNumber(obj.amount))
                                            .setCustomId(`BUYCOINS-${obj.amount}`),
                                        async action() {
                                            const myData = await findOrCreateOne("users", { findOption: a.user.id });
                                            if (myData.dollars < obj.cost) return Embed(a.msg).setError(TextExp(6, a.sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                            await Promise.all([
                                                changeMoney("coins", a.user.id, obj.amount),
                                                changeMoney("dollars", a.user.id, -obj.cost)
                                            ]);
                                            return Embed(a.msg).setSuccess(TextExp(26, a.sd.language)).send(5000);
                                        }
                                    }
                                })
                                ].reverse()
                            }
                        } as Page<MessageEmbed>
                    },
                    nextPage: true
                }
            ]
        }
    }

}