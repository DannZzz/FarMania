import { Client, Util } from "client-discord";
import { stripIndents } from "common-tags";
import { Guild, Message, MessageButton, MessageEmbed, User } from "discord.js";
import { REPUTATION_REWARDS } from "../config";
import { findOrCreateOne, models } from "../database/db";
import { GameModel } from "../database/models/GameModel";
import { ServerModel } from "../database/models/ServerModel";
import { Currency, CurrencyType } from "../docs/currency/Main";
import { TextExp } from "../docs/languages/createText";
import { findLevel } from "../docs/levels/levels";
import { Embed } from "./Embed";
import { Functions } from "./Functions";
import { Page } from "./InterfaceEdition";

export class Rate {
    private user: User;
    private server: ServerModel;
    constructor(
        private readonly client: Client,
        private readonly msg: Message,
        private readonly guild: Guild,
    ) {
        this.user = msg.author;
    }

    async createCategory(): Promise<Page<MessageEmbed>> {
        const a = this;
        return {
            buttonType: "PRIMARY",
            description: this.t(60),
            buttonLabel: this.t(59),
            emoji: "🏆",
            type: "Group",
            customId: "RatesAll",
            async embed() {
                return Embed(a.msg).setTitle(`🏆 | ${a.t(59)}`).setText(a.t(33));
            },
            buttons: async () => {
                return [
                    {
                        button: new MessageButton()
                            .setCustomId("COIN_TOP")
                            .setStyle("SECONDARY")
                            .setEmoji(Currency.coins.emoji),
                        async action() {
                            return await a.GetMoneyTop("coins")
                        },
                        nextPage: true
                    },
                    {
                        button: new MessageButton()
                            .setCustomId("DOLLAR_TOP")
                            .setStyle("SECONDARY")
                            .setEmoji(Currency.dollars.emoji),
                        async action() {
                            return await a.GetMoneyTop("dollars")
                        },
                        nextPage: true
                    },
                    {
                        button: new MessageButton()
                            .setCustomId("REPUTATION_TOP")
                            .setStyle("SECONDARY")
                            .setEmoji("✨"),
                        async action() {
                            return await a.RepTop();
                        },
                        nextPage: true
                    },
                    {
                        button: new MessageButton()
                            .setCustomId("XP_TOP")
                            .setStyle("SECONDARY")
                            .setEmoji("⭐"),
                        async action() {
                            return await a.XpTop();
                        },
                        nextPage: true
                    }
                ]
            }
        }
    }

    private async RepTop(): Promise<Page<MessageEmbed>> {
        const a = this;
        return {
            async embed() {
                const all = await models.games.find().exec()
                const filtered = all.filter(data => data.animals);
                const sorted = filtered.sort((a, b) => Functions.calculateReputation(b.animals) - Functions.calculateReputation(a.animals));
                const sliced = sorted.slice(0, 10);
                const texted = await Promise.all(sliced.map(async (data, i) => {
                    const user = await a.client.users.fetch(data._id);
                    const name = user ? user.tag : a.t(57);

                    return `**${i + 1}.** ${name} — ✨\`${a.client.util.formatNumber(Functions.calculateReputation(data.animals))}\``
                }));
                return Embed(a.msg).setTitle(`🏆 | ${a.t(58)} ✨`).setText(stripIndents`
                ${a.t(148)}
                **#1** — ${Currency.dollars.emoji}\`${Util.formatNumber(REPUTATION_REWARDS[0])}\`
                **#2** — ${Currency.dollars.emoji}\`${Util.formatNumber(REPUTATION_REWARDS[1])}\`
                **#3** — ${Currency.dollars.emoji}\`${Util.formatNumber(REPUTATION_REWARDS[2])}\`

                ${texted?.length > 0 ? texted.join("\n") : a.t(56)}`) as MessageEmbed;
            },
            customId: "a",
            description: "a",
            buttonLabel: "a",
            buttonType: "SECONDARY",
            type: "Group"
            
        }
    }

    private async GetMoneyTop(currency: CurrencyType): Promise<Page<MessageEmbed>> {
        const a = this;
        return {
            async embed() {
                const all = await models.users.find().exec()
                const sorted = all.sort((a, b) => b[currency] - a[currency]);
                const sliced = sorted.slice(0, 10);
                
                const texted = await Promise.all(sliced.map(async (data, i) => {
                    const user = await a.client.users.fetch(data._id);
                    const name = user ? user.tag : a.t(57)
                    return `**${i + 1}.** ${name} — ${Currency[currency].emoji}\`${a.client.util.formatNumber(data[currency])}\``
                }));
                return Embed(a.msg).setText(`🏆 | ${a.t(58)} ${Currency[currency].emoji}\n\n${texted?.length > 0 ? texted.join("\n") : a.t(56)}`) as MessageEmbed;
            },
            customId: "a",
            description: "a",
            buttonLabel: "a",
            buttonType: "SECONDARY",
            type: "Group"
            
        }

    }

    private async XpTop(): Promise<Page<MessageEmbed>> {
        const a = this;
        return {
            async embed() {
                const all = await models.users.find({xp: {$exists: true}}).exec();
                const filtered = all.filter(data => data.xp);
                const sorted = filtered.sort((a, b) => b.xp - a.xp);
                const sliced = sorted.slice(0, 10);
                const texted = await Promise.all(sliced.map(async (data, i) => {
                    const user = await a.client.users.fetch(data._id);
                    const name = user ? user.tag : a.t(57);

                    return `**${i + 1}.** ${name} — \`${a.client.util.formatNumber(Math.round(data.xp || 0))} xp\` [⭐ **${a.client.util.formatNumber(findLevel(data.xp || 0).currentLevel)}**]`
                }));
                return Embed(a.msg).setText(`🏆 | ${a.t(58)} ⭐\n\n${texted?.length > 0 ? texted.join("\n") : a.t(56)}`) as MessageEmbed;
            },
            customId: "a",
            description: "a",
            buttonLabel: "a",
            buttonType: "SECONDARY",
            type: "Group"
            
        }
    }

    async getData() {
        this.server = await findOrCreateOne("servers", { findOption: this.guild.id });
        return this;
    }

    private t(index: number) {
        return TextExp(index, this.server.language);
    }
}