import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { changeMoney, findOrCreateOne, models } from "../../database/db";
import { ButtonEmojis } from "../../docs/emojis/emoji";
import Text, { TextExp } from "../../docs/languages/createText";
import { Embed } from "../../structures/Embed";
import { FarmInterface } from "../../structures/FarmInterface";
import { InterfaceEdition, Page } from "../../structures/InterfaceEdition";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { stripIndents } from "common-tags";
import { Currency, CurrencyType } from "../../docs/currency/Main";
import { calculateSpace, costForSpaceNextLevel } from "../../docs/levels/space";
import { DailyGiftsAdding, DELETE_TIMEOUT_MESSAGES, DEVELOPER_ID, EMAIL, UNLOCK_TRANSLATION_LEVEL, OneDay, Rewards, SLOTS_JACKPOT_BOOST, SPACE_FOR_ONE_LEVEL, DANN_SERVER, SUPPORT_SERVER, SUCCESS_EMOJI, BlackJackBets, RouletteChannel } from "../../config";
import { ShopInterface } from "../../structures/ShopInterface";
import { ServerSettings } from "../../structures/ServerSettings";
import { Rate } from "../../structures/Rate";
import ms from "ms";
import { TicTacToe } from "../../structures/TicTacToe/Game";
import { MessageCollectorExp } from "../../structures/Collector";
import { ReputationLevel } from "../../structures/ReputationLevels";
import { Functions } from "../../structures/Functions";
import { DateTime } from "../../structures/DateAndTime";
import { SlotSymbols } from "../../structures/SlotMachine/Symbols";
import { jackpotString } from "../games/slots";
import { RedeemCode } from "../../structures/RedeemCodes";
import { checkLevel, findLevel } from "../../docs/levels/levels";
import { StarImage } from "../../structures/LevelStar";
import { Achievements, findAchievement, updateDefault } from "../../docs/levels/achievemets";
import { Listener } from "../../structures/Listener";
import { Animals } from "../../docs/animals/Animals_list";
import { BlackJack } from "../../structures/BlackJack";
import { RouletteMenu } from "../../structures/Roulette/RouletteMenu";

const redeemCodeListener = new Set();

export default class Start extends MessageCommand {
    constructor() {
        super({
            name: "start",
            description: "start test",
            aliases: ["s"]
        })
    }

    async execute({ msg, methods, prefix, args, client, sd }: MessageCommandRunOptions): Promise<any> {
        const backButton = new MessageButton()
            .setCustomId("x-Back")
            .setStyle("DANGER")
            .setEmoji(ButtonEmojis.xBack);

        new InterfaceEdition(client, [
            {
                customId: "PROFILESETTINGS",
                type: "Group",
                description: TextExp(126, sd.language),
                buttonLabel: TextExp(127, sd.language),
                buttonType: "PRIMARY",
                emoji: "📃",
                async embed() {
                    const g = await findOrCreateOne("games", {findOption: msg.author.id});
                    const space = calculateSpace(g.spaceLevel, g.animals);
                    const user = await findOrCreateOne("users", {findOption: msg.author.id});
                    const level = findLevel(user.xp || 0);
                    return Embed(msg).setText(stripIndents`
                    ${await FarmInterface.moneyInterface(msg.author.id, true)}
                    ✨ \`${Functions.calculateReputation(g.animals)}\`
                    📐 \`${space.space}/${space.validSpace}\`
                    
                    ⭐ \`${client.util.formatNumber(Math.round(user.xp))}/${client.util.formatNumber(level.needXp)} xp\`
                    ${TextExp(128, sd.language)} \`${client.util.formatNumber(Math.round(g.animals.map(obj => obj?.count || 0).reduce((a, v) => a + v, 0)))}\`
                    `).setThumbnail("attachment://star.png")
                },
                async attachments ( ) {
                    const user = await findOrCreateOne("users", {findOption: msg.author.id});
                    const level = findLevel(user.xp || 0);
                    const card = new StarImage(level.currentLevel);
                    return [await card.build()];
                },
                async buttons() {
                    return [
                        {
                            button: new MessageButton()
                                .setCustomId("MAKETRANSLATION")
                                .setLabel(TextExp(129, sd.language))
                                .setStyle("PRIMARY"),
                            async action() {
                                if (!(await checkLevel(msg.author.id, UNLOCK_TRANSLATION_LEVEL))) return Embed(msg).setError(`${TextExp(130, sd.language)} **${UNLOCK_TRANSLATION_LEVEL}**`).send(DELETE_TIMEOUT_MESSAGES);

                                const cmd: MessageCommand = client.messageCommands.get("translate-money");
                                cmd.execute({client, msg, args: [], prefix, sd, methods});
                            }
                        }
                    ]
                }
            },
            {
                customId: "Farm",
                type: "Group",
                embed: async () => (await (await new FarmInterface(client, msg.author, msg.guild, msg).getData()).getAnimalsEmbed()),
                buttonLabel: TextExp(10, sd.language),
                description: TextExp(11, sd.language),
                buttonType: "PRIMARY",
                emoji: "👩‍🌾",
                buttons: async () => await (await new FarmInterface(client, msg.author, msg.guild, msg).getData()).getAnimalsButtons(),
                nextPage: { // Farm settings
                    async embed() {
                        const money = await FarmInterface.moneyInterface(msg.author.id);
                        const embed = Embed(msg).setText(stripIndents`
                        ${TextExp(13, sd.language)}
                        `)
                            .setTitle(TextExp(45, sd.language))

                        return embed;
                    },
                    buttons: async () => [
                        { // STORAGE SETTINGS
                            button: new MessageButton()
                                .setCustomId("storage")
                                .setEmoji("📐")
                                .setStyle("SECONDARY"),
                            nextPage: true,
                            async action() {
                                return {
                                    customId: "Storage_data",
                                    buttonLabel: "asd",
                                    buttonType: "DANGER",
                                    type: "Group",
                                    description: "sd",
                                    async embed() {
                                        const data = await findOrCreateOne("games", { findOption: msg.author.id });
                                        const obj = costForSpaceNextLevel(data.spaceLevel || 1);
                                        return Embed(msg).setText(stripIndents`
                                        ${await FarmInterface.moneyInterface(msg.author.id)}
                                        
                                        ${TextExp(16, sd.language)} ${client.util.formatNumber(data.spaceLevel || 1)} + 1
                                        ${TextExp(17, sd.language)}: ${(data.spaceLevel || 1) * SPACE_FOR_ONE_LEVEL} + ${SPACE_FOR_ONE_LEVEL}
                                        ${TextExp(18, sd.language)} ${Currency.coins.emoji}\`${client.util.formatNumber(obj.coins)}\` ${TextExp(19, sd.language)} ${Currency.dollars.emoji}\`${client.util.formatNumber(obj.dollars)}\`
                                        `).setTitle(TextExp(13, sd.language))
                                    },
                                    buttons: async () => [
                                        {
                                            button: new MessageButton()
                                                .setCustomId("levelUpSpaceCoin")
                                                .setEmoji(Currency.coins.emoji)
                                                .setLabel(TextExp(14, sd.language))
                                                .setStyle("SECONDARY"),
                                            async action() {
                                                const myData = await findOrCreateOne("users", { findOption: msg.author.id });
                                                const myDataGame = await findOrCreateOne("games", { findOption: msg.author.id });
                                                const cost = costForSpaceNextLevel(myDataGame.spaceLevel || 1).coins;
                                                if (myData.coins < cost) {
                                                    return Embed(msg).setError(TextExp(6, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                                }
                                                await Promise.all([
                                                    models.games.updateOne({ _id: msg.author.id }, { $inc: { spaceLevel: 1 } }),
                                                    changeMoney("coins", msg.author.id, -cost)
                                                ])
                                                return Embed(msg).setSuccess(TextExp(15, sd.language)).send(DELETE_TIMEOUT_MESSAGES)
                                            }
                                        },
                                        {
                                            button: new MessageButton()
                                                .setCustomId("levelUpSpaceDollar")
                                                .setEmoji(Currency.dollars.emoji)
                                                .setLabel(TextExp(14, sd.language))
                                                .setStyle("SECONDARY"),
                                            async action() {
                                                const myData = await findOrCreateOne("users", { findOption: msg.author.id });
                                                const myDataGame = await findOrCreateOne("games", { findOption: msg.author.id });
                                                const cost = costForSpaceNextLevel(myDataGame.spaceLevel || 1).dollars;
                                                if (myData.dollars < cost) {
                                                    return Embed(msg).setError(TextExp(6, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                                }
                                                await Promise.all([
                                                    models.games.updateOne({ _id: msg.author.id }, { $inc: { spaceLevel: 1 } }),
                                                    changeMoney("dollars", msg.author.id, -cost)
                                                ])
                                                return Embed(msg).setSuccess(TextExp(15, sd.language)).send(DELETE_TIMEOUT_MESSAGES)
                                            }
                                        },
                                        {
                                            button: new MessageButton()
                                                .setCustomId("levelUpSpaceCoin5X")
                                                .setEmoji(Currency.coins.emoji)
                                                .setLabel(TextExp(14, sd.language) + " x5")
                                                .setStyle("SECONDARY"),
                                            async action() {
                                                const myData = await findOrCreateOne("users", { findOption: msg.author.id });
                                                const myDataGame = await findOrCreateOne("games", { findOption: msg.author.id });
                                                const cost = costForSpaceNextLevel(myDataGame.spaceLevel || 1).coins * 5;
                                                if (myData.coins < cost) {
                                                    return Embed(msg).setError(TextExp(6, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                                }
                                                await Promise.all([
                                                    models.games.updateOne({ _id: msg.author.id }, { $inc: { spaceLevel: 5 } }),
                                                    changeMoney("coins", msg.author.id, -cost)
                                                ])
                                                return Embed(msg).setSuccess(TextExp(15, sd.language)).send(DELETE_TIMEOUT_MESSAGES)
                                            }
                                        },
                                        {
                                            button: new MessageButton()
                                                .setCustomId("levelUpSpaceDollar5X")
                                                .setEmoji(Currency.dollars.emoji)
                                                .setLabel(TextExp(14, sd.language) + " x5")
                                                .setStyle("SECONDARY"),
                                            async action() {
                                                const myData = await findOrCreateOne("users", { findOption: msg.author.id });
                                                const myDataGame = await findOrCreateOne("games", { findOption: msg.author.id });
                                                const cost = costForSpaceNextLevel(myDataGame.spaceLevel || 1).dollars * 5;
                                                if (myData.dollars < cost) {
                                                    return Embed(msg).setError(TextExp(6, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                                }
                                                await Promise.all([
                                                    models.games.updateOne({ _id: msg.author.id }, { $inc: { spaceLevel: 5 } }),
                                                    changeMoney("dollars", msg.author.id, -cost)
                                                ])
                                                return Embed(msg).setSuccess(TextExp(15, sd.language)).send(DELETE_TIMEOUT_MESSAGES)
                                            }
                                        }
                                    ],
                                } as Page<MessageEmbed>
                            }
                        }
                    ],
                    customId: "farm_settings",
                    buttonLabel: TextExp(12, sd.language),
                    emoji: "⚙",
                    type: "Group",
                    description: "farm settings",
                    buttonType: "SECONDARY"
                }
            },
            await (new ShopInterface(client, msg, sd)).main(),
            await (new ServerSettings(client, msg, msg.guild).main()),
            await ((await new Rate(client, msg, msg.guild).getData()).createCategory()),
            {
                customId: 'rewardsALl',
                description: TextExp(89, sd.language) + ".",
                buttonLabel: TextExp(89, sd.language),
                buttonType: "PRIMARY",
                type: "Group",
                emoji: "🎉",
                async embed() {
                    const Rep = new ReputationLevel(client, msg, sd)
                    const data = await findOrCreateOne("games", { findOption: msg.author.id });
                    return Embed(msg).setTitle(`🎉 | ${TextExp(89, sd.language)}`).setText(await FarmInterface.moneyInterface(msg.author.id) + " — " + `✨\`${client.util.formatNumber(Functions.calculateReputation(data.animals))}\`` + "\n\n" + await Rep.makeText());
                },
                buttons: async () => {
                    const Rep = new ReputationLevel(client, msg, sd)
                    return [
                        await (async () => {
                            const a = {
                                sd,
                                msg,
                                user: msg.author
                            }
                            const myData = await findOrCreateOne("users", { findOption: a.user.id });
                            const last = myData.lastDaily || new Date();
                            const bool = last <= new Date();
                            var thisDay: number = myData.dailyLine;
                            if (last.getTime() + OneDay < Date.now()) thisDay = 1;
                            return {
                                button: new MessageButton()
                                    .setStyle(bool ? "SUCCESS" : "DANGER")
                                    .setCustomId("dailyReward")
                                    .setLabel(`${TextExp(64, a.sd.language)}: ${thisDay} — ${bool ? TextExp(63, a.sd.language) : `${TextExp(62, a.sd.language)} ${DateTime.formatTime(DateTime.getTimeData(last.getTime()), false, Functions.getTimeLang(a.sd.language))}`}`)
                                    .setDisabled(bool ? false : true),
                                async action() {
                                    const myData = await findOrCreateOne("users", { findOption: a.user.id });
                                    const last = myData.lastDaily || new Date();
                                    const bool = last <= new Date();
                                    if (!bool) return Embed(a.msg).setError(TextExp(66, a.sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                    var thisDay: number = myData.dailyLine;
                                    if (last.getTime() + OneDay < Date.now()) thisDay = 1;
                                    var prize = thisDay * DailyGiftsAdding.coins;
                                    var type: CurrencyType = 'coins';
                                    if (thisDay % DailyGiftsAdding.megaAfterDays === 0) {
                                        prize = (thisDay / DailyGiftsAdding.megaAfterDays) * DailyGiftsAdding.mega;
                                        type = "dollars";
                                    }
                                    await models.users.updateOne({ _id: a.user.id }, {
                                        $set: {
                                            lastDaily: new Date(Date.now() + OneDay),
                                            dailyLine: thisDay + 1
                                        },
                                        $inc: {
                                            [type]: Math.round(prize),
                                            chips: DailyGiftsAdding.chips
                                        }
                                    });
                                    return Embed(a.msg).setTitle(`🎁 | ${TextExp(64, a.sd.language)}: ${thisDay}`).setText(`${TextExp(65, a.sd.language)} ${Currency[type].emoji}\`${client.util.formatNumber(prize)}\`  ${Currency.chips.emoji}\`${client.util.formatNumber(DailyGiftsAdding.chips)}\`\n${TextExp(66, a.sd.language)}`).send(DELETE_TIMEOUT_MESSAGES + 5000);
                                }
                            }
                        })(),
                        {
                            button: new MessageButton()
                                .setCustomId("CollectAllRewards")
                                .setLabel(TextExp(92, sd.language))
                                .setDisabled(await Rep.checkCollecting() ? false : true)
                                .setStyle(await Rep.checkCollecting() ? "SUCCESS" : "DANGER"),
                            async action() {
                                const Rep = new ReputationLevel(client, msg, sd)
                                await Rep.collectAll();
                            }
                        },
                        {
                            button: new MessageButton()
                                .setCustomId("OpenAchievements")
                                .setLabel(TextExp(150, sd.language))
                                .setStyle("PRIMARY")
                                .setEmoji("🌟"),
                            nextPage: true,
                            async action(): Promise<Page<MessageEmbed>> {
                                return {
                                    async embed() {
                                        await updateDefault(msg.author.id);

                                        const _Listener = new Listener(msg.author.id, await findOrCreateOne("users", {findOption: msg.author.id}));
                                        // console.log(_Listener);

                                        const texts: string[] = [];

                                        for (let a of Achievements) {
                                            const prog = Math.round(_Listener.get(a.name, true));
                                            const level = Functions.findEqualAchievementLevel(a.name, prog);
                                            const ach = a.list[level] ? a.list[level] : a.list.at(-1);

                                            const emoji = ach.reward in Currency ? Currency[ach.reward].emoji : Animals[ach.reward].emoji;
                                            
                                            texts.push(
                                                stripIndents`
                                                **${TextExp(151, sd.language)} ${ level !== a.list.length ? `${client.util.formatNumber(prog)}/${client.util.formatNumber(ach.need)}` : SUCCESS_EMOJI}**
                                                ${TextExp(a.textIndex, sd.language)} ${a.emoji} \`${client.util.formatNumber(ach.need)}\`
                                                ${TextExp(152, sd.language)}: ${emoji}\`${client.util.formatNumber(ach.rewardAmount)}\`
                                                `
                                            )
                                        }
                                        
                                        return Embed(msg)
                                            .setTitle(`🌟 | ${TextExp(150, sd.language)}`)
                                            .setText(await FarmInterface.moneyInterface(msg.author.id)+ "\n\n" + texts.join("\n\n"))
                                    },
                                    buttons: async () => {
                                        const can = await Functions.checkAllAchievements(msg.author.id)
                                        return [
                                            {
                                                button: new MessageButton()
                                                    .setCustomId("CollectAll")
                                                    .setLabel(TextExp(92, sd.language))
                                                    .setStyle(can ? "SUCCESS" : "DANGER")
                                                    .setDisabled(can ? false : true),
                                                async action() {
                                                    const data = await findOrCreateOne("users", {findOption: msg.author.id})
                                                    const l = new Listener(msg.author.id, data);

                                                    for (let ach of Achievements) {
                                                        if (ach.disabled) continue;
                                                        const achievement = data.achievements.find(a => a.name === ach.name);
                                                        await Functions.updateWhileDoneAchievemt(msg, msg.author.id, ach.name, Functions.findEqualAchievementLevel(ach.name, l.get(ach.name, true)), achievement?.level || 0)
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    type: "Group",
                                }
                            },
                        }
                    ]
                }
            },
            {
                customId: "GamesAll",
                description: TextExp(69, sd.language) + ".",
                buttonLabel: TextExp(69, sd.language),
                buttonType: "PRIMARY",
                emoji: "🎰",
                type: "Group",
                async embed() {
                    return Embed(msg).setText(TextExp(70, sd.language)) as MessageEmbed;
                },
                buttons: async () => {
                    const msgId = await (new RouletteMenu(client)).getMessage()
                    const rouletteUrl = `https://canary.discord.com/channels/${RouletteChannel[0]}/${RouletteChannel[1]}/${msgId.id}`
                    return [
                        {
                            button: new MessageButton()
                                .setCustomId("start-ttt")
                                .setStyle("SECONDARY")
                                .setLabel(TextExp(74, sd.language)),
                            nextPage: true,
                            async action(): Promise<Page<MessageEmbed>> {
                                return {
                                    async embed() {
                                        return Embed(msg).setText(await FarmInterface.moneyInterface(msg.author.id) + "\n\n" + TextExp(75, sd.language)) as MessageEmbed;
                                    },
                                    type: "Group",
                                    buttons: async () => [
                                        {
                                            button: new MessageButton()
                                                .setCustomId("AIBOTTTT")
                                                .setStyle("SECONDARY")
                                                .setEmoji("🤖")
                                                .setLabel("A.I."),
                                            async action() {
                                                const command = client.messageCommands.get("tictactoe") as MessageCommand;
                                                command.execute({ client, msg, args: [], prefix, methods, sd });
                                            }
                                        },
                                        {
                                            button: new MessageButton()
                                                .setCustomId("REAL_MEMBER")
                                                .setStyle("SECONDARY")
                                                .setEmoji("🧑")
                                                .setLabel(TextExp(77, sd.language)),
                                            async action() {
                                                const getMsg = await Embed(msg).setText(TextExp(78, sd.language)).send();
                                                const command = client.messageCommands.get("tictactoe") as MessageCommand;
                                                const collector = new MessageCollectorExp(msg.channel, {
                                                    filter: [msg.author.id],
                                                    time: 20000
                                                })
                                                var l = false;
                                                collector.on(undefined, async (m) => {
                                                    l = true;
                                                    collector.stop();
                                                    const splited = m.content.trim().split(/ g/);
                                                    m.delete();
                                                    command.execute({ client, msg: m, args: splited, prefix, methods, sd });
                                                });
                                                collector.end(() => {
                                                    if (!l) {
                                                        getMsg.edit({
                                                            embeds: [Embed(msg).setError(TextExp(50, sd.language))]
                                                        })
                                                    } else {
                                                        getMsg.delete();
                                                    }
                                                })

                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            button: new MessageButton()
                                .setCustomId("MathGame-Start")
                                .setLabel(TextExp(86, sd.language))
                                .setStyle("SECONDARY"),
                            nextPage: true,
                            async action(): Promise<Page<MessageEmbed>> {
                                return {
                                    async embed() {
                                        return Embed(msg).setText(TextExp(87, sd.language)) as MessageEmbed;
                                    },
                                    type: "Group",
                                    buttons: async () => {
                                        return [
                                            {
                                                button: new MessageButton()
                                                    .setLabel(TextExp(88, sd.language))
                                                    .setCustomId("startGameMath")
                                                    .setStyle("SECONDARY"),
                                                async action() {
                                                    const command = client.messageCommands.get("math") as MessageCommand;
                                                    command.execute({ client, msg, args, methods, prefix, sd });
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        {
                            button: new MessageButton()
                                .setCustomId("STARTSLOTS")
                                .setEmoji("🎰")
                                .setLabel(TextExp(95, sd.language))
                                .setStyle("SECONDARY"),
                            nextPage: true,
                            async action(): Promise<Page<MessageEmbed>> {
                                return {
                                    async embed() {
                                        return Embed(msg).setText(`${await FarmInterface.moneyInterface(msg.author.id, true)}\n\n${await jackpotString(client, sd.language)}\n\n${TextExp(123, sd.language)} \`${Math.round(SLOTS_JACKPOT_BOOST / 1 * 100)}%\` ${TextExp(124, sd.language)}\n\n`).setTitle(`🎰 | ${TextExp(95, sd.language)}`) as MessageEmbed;
                                    },
                                    type: "Group",
                                    async buttons() {
                                        return [
                                            {
                                                button: new MessageButton()
                                                    .setCustomId("PLAYSLOTSMACHINE")
                                                    .setLabel(TextExp(96, sd.language))
                                                    .setStyle("SUCCESS"),
                                                async action () {
                                                    const command = client.messageCommands.get("slots") as MessageCommand;
                                                    command.execute({ client, msg, args: [], methods, prefix, sd });
                                                }
                                            },
                                        ]
                                    },
                                    nextPage: {
                                        buttonLabel: TextExp(99, sd.language),
                                        buttonType: "PRIMARY",
                                        customId: "SLOTCOMBINATIONS",
                                        type: "Group",
                                        async embed() {
                                            const symbols = SlotSymbols;
                                            const x3 = [];
                                            symbols.filter(s => s.minimum === 3).forEach(s => {
                                                x3.push(`x3 ${s.emoji} --> ${s.adding} * `)
                                            });

                                            const x4 = [];
                                            symbols.filter(s => s.minimum <= 4).forEach(s => {
                                                if (s.minimum === 4) {
                                                    x4.push(`x4 ${s.emoji} --> ${s.adding} * `)
                                                } else if (s.minimum < 4) {
                                                    x4.push(`x4 ${s.emoji} --> ${s.adding} * 2 * `)
                                                }
                                            });

                                            const x5 = [];
                                            symbols.filter(s => s.minimum <= 5 && !s.customReward).forEach(s => {
                                                if (s.minimum === 5) {
                                                    x5.push(`x5 ${s.emoji} --> ${s.adding} * `)
                                                } else if (s.minimum === 4) {
                                                    x5.push(`x5 ${s.emoji} --> ${s.adding} * 2 * `)
                                                } else if (s.minimum < 4) {
                                                    x5.push(`x5 ${s.emoji} --> ${s.adding} * 3 * `)
                                                }
                                            });
                                            const customs = [];
                                            symbols.filter(s => s.customReward).forEach(s => {
                                                customs.push(`x5 ${s.emoji} --> ${TextExp(s.customInterface(), sd.language)}`)
                                            })

                                            return Embed(msg)
                                                .setTitle(TextExp(99, sd.language))
                                                .setText(stripIndents`
                                                ${customs.join("\n")}

                                                ${x5.join(`${TextExp(101, sd.language)}\n`)} ${TextExp(101, sd.language)}

                                                ${x4.join(`${TextExp(101, sd.language)}\n`)} ${TextExp(101, sd.language)}

                                                ${x3.join(`${TextExp(101, sd.language)}\n`)} ${TextExp(101, sd.language)}
                                                `) as MessageEmbed;
                                        }
                                    }
                                }
                            }
                        },
                        {
                            button: new MessageButton()
                                .setCustomId("STARTCARDGAME")
                                .setStyle("SECONDARY")
                                .setLabel(TextExp(146, sd.language))
                                .setEmoji("🃏"),
                            nextPage: true,
                            async action(): Promise<Page<MessageEmbed>> {
                                return {
                                    async embed() {
                                        return Embed(msg).setText(TextExp(147, sd.language)) as MessageEmbed;
                                    },
                                    type: "Group",
                                    buttons: async () => {
                                        return [
                                            {
                                                button: new MessageButton()
                                                    .setStyle("PRIMARY")
                                                    .setCustomId("START-CG")
                                                    .setLabel(TextExp(88, sd.language)),
                                                async action() {
                                                    const command = client.messageCommands.get("card-game") as MessageCommand;
                                                    command.execute({client, msg, args, methods, sd, prefix});
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        {
                            button: new MessageButton()
                                .setCustomId("STARTBLACKJACK")
                                .setStyle("SECONDARY")
                                .setLabel(TextExp(162, sd.language)),
                            nextPage: true,
                            async action (): Promise<Page<MessageEmbed>> {
                                return {
                                    async embed() {
                                        return Embed(msg).setText(await FarmInterface.moneyInterface(msg.author.id) + "\n\n" + TextExp(163, sd.language))
                                    },
                                    type: "Group",
                                    buttons: async () => {
                                        return BlackJackBets.map(bet => {
                                            return {
                                                button: new MessageButton().setCustomId(`BJBET-${bet}`).setLabel(`${client.util.formatNumber(bet)}`).setEmoji(Currency.dollars.emoji).setStyle("SECONDARY"),
                                                async action() {
                                                    if (BlackJack.hasUser(msg.author.id)) return;
                                                    const command = client.messageCommands.get("blackjack") as MessageCommand;
                                                    const fn = await command.execute({client, msg, args, methods, sd, prefix});
                                                    const us = await findOrCreateOne("users", {findOption: msg.author.id});
                                                    if (us.dollars < bet) return Embed(msg).setError(`${TextExp(25, sd.language)} ${Currency.dollars.emoji}`).send(DELETE_TIMEOUT_MESSAGES);
                                                    await changeMoney("dollars", msg.author.id, -bet)
                                                    fn(bet);
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        },
                        {
                            button: new MessageButton()
                                .setURL(rouletteUrl)
                                .setStyle("LINK")
                                .setLabel(TextExp(166, sd.language)),
                            async action() {}
                        }
                    ]
                }

            },
            {
                description: TextExp(109, sd.language) + ".",
                buttonLabel: TextExp(110, sd.language),
                buttonType: "PRIMARY",
                emoji: "❓",
                customId: "SPRAWKA",
                type: "Group",
                async embed() {
                    const dev = await client.users.fetch(DEVELOPER_ID);
                    return Embed(msg)
                        .setThumbnail(client.user.displayAvatarURL())
                        .setTitle(TextExp(109, sd.language))
                        .setText(stripIndents`
                        ${TextExp(111, sd.language)} **JavaScript(TypeScript)**
                        ${TextExp(112, sd.language)} **${dev ? dev.tag : TextExp(57, sd.language)}**
                        ${TextExp(117, sd.language)} \`${client.util.formatNumber(client.guilds.cache.size)}\`
                        ${TextExp(118, sd.language)} \`${EMAIL}\`
                        ${TextExp(119, sd.language)}
                        **[${TextExp(137, sd.language)}](${DANN_SERVER})**
                        **[${TextExp(138, sd.language)}](${SUPPORT_SERVER})**

                        ${TextExp(113, sd.language)}
                        `) as MessageEmbed;
                        
                },
                buttons: async () => {
                    return [
                        {
                            button: new MessageButton()
                                .setCustomId("RedeemCode")
                                .setLabel(TextExp(114, sd.language))
                                .setStyle("PRIMARY"),
                            async action() {
                                if (redeemCodeListener.has(msg.author.id)) return;
                                redeemCodeListener.add(msg.author.id);
                                const m = await Embed(msg).setText(TextExp(116, sd.language)).send();
                                const c = new MessageCollectorExp(msg.channel, {filter: [msg.author.id], time: 30000});
                                let b = false;
                                c.end(() => {
                                    redeemCodeListener.delete(msg.author.id);
                                    m.delete();
                                    if (!b) return Embed(msg).setError(TextExp(50, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                })
                                
                                c.on(undefined, async (m) => {
                                    if (m.content) {
                                        b = true;
                                        c.stop();
                                        const ret = await RedeemCode.use(msg.author.id, m.content);
                                        if (typeof ret === "number") {
                                            return Embed(msg).setError(TextExp(ret, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
                                        } else {
                                            return Embed(msg).setSuccess(TextExp(115, sd.language) + "\n\n" + TextExp(73, sd.language) + ": " + ret).send(DELETE_TIMEOUT_MESSAGES * 2)
                                        }
                                    }
                                })
                            }
                        }
                    ]
                }
            }
        ], backButton).createMenu(msg);
    }
}


export async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createRows(buttons: MessageButton[]) {
    const rows: MessageActionRow[] = [];
    for (let i = 0; i < buttons.length; i += 3) {
        rows.push(new MessageActionRow().addComponents(buttons.slice(i, i + 3)))
    }
    return rows;
}