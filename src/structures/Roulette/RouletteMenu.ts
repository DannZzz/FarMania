import { Client, Util } from "client-discord";
import { stripIndents } from "common-tags";
import { Message, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { colors, RouletteBets, RouletteChannel, RouletteGameDuration } from "../../config";
import { changeMoney, findOrCreateOne, models } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import { Embed } from "../Embed";
import { InterfaceEdition } from "../InterfaceEdition";
import { Roulette, RouletteBet } from "./Roulette";

export var nextTime: Date;

export class RouletteMenu {
    constructor(private client: Client) {

    }

    async getMessage(): Promise<Message> {
        const b = await findOrCreateOne("bot", { findOption: "main" });
        const g = await this.client.guilds.fetch(RouletteChannel[0]);
        const c = await g.channels.fetch(RouletteChannel[1]) as TextChannel;

        var msgId: string;
        if (b.rouletteMessage) {
            msgId = b.rouletteMessage;
            // console.log("started: " + msgId)
            var msg: Message;
            try {
               msg = await c.messages.fetch(msgId);
            } catch {
            }
             
            // console.log("need " + msg)
            if (!msg) {
                const m = await this.sendMessage() as Message;
                msgId = m.id;
                await models.bot.updateOne({ _id: "main" }, { $set: { rouletteMessage: msgId } });
                return m;
            }
            return msg
        } else {
            const m = await this.sendMessage() as Message;
            msgId = m.id;
            await models.bot.updateOne({ _id: "main" }, { $set: { rouletteMessage: msgId } });
            return m;
        }

    }

    async sendMessage(onlyEmbed: boolean = false): Promise<Message | MessageEmbed> {
        const g = await this.client.guilds.fetch(RouletteChannel[0]);
        const c = await g.channels.fetch(RouletteChannel[1]) as TextChannel;

        const r = new Roulette(c.id);

        const embed = new MessageEmbed()
            .setColor(colors.main)
            .setTitle("🎯 | Рулетка")
            .setDescription(stripIndents`
        Сделай свою ставку!
        

        ${r.checkStart() ? stripIndents`
        Конец раунда: ${this.client.timestamp(nextTime.getTime(), "R")}
        Ставки:

        ${r.players.map((user, i) => {
                const name = g.members.cache.has(user.id) ? g.members.cache.get(user.id).user.tag : "Неизвестный";
                return `${i + 1}. ${name} — ${Roulette.betTypeToString(user.betType)} (${Currency.dollars.emoji}\`${Util.formatNumber(user.bet)}\`)`
            }).join("\n")}` : "Игра ещё не началась."}
        `)
            .setThumbnail("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F155%2F713%2Foriginal%2Froulette-table-vector.jpg&f=1&nofb=1")

        if (onlyEmbed) return embed;

        return await c.send({
            embeds: [
                embed
            ],
            components: InterfaceEdition.createRows(RouletteBets.map(bet => {
                return new MessageButton()
                    .setCustomId("MakeNewRoulleteBet-" + bet)
                    .setEmoji(Currency.dollars.emoji)
                    .setLabel("" + Util.formatNumber(bet))
                    .setStyle("PRIMARY")
            })

            )
        })
    }

    async editMessage(msg: Message) {
        const embed = await this.sendMessage(true) as MessageEmbed;
        return await msg.edit({ embeds: [embed] })
    }

    startGame(msg: Message) {
        const r = new Roulette(RouletteChannel[1]);
        // console.log(r)
        if (r.checkStart() && (!nextTime || nextTime < new Date())) {
            nextTime = new Date(Date.now() + RouletteGameDuration);
            setTimeout(async () => {
                // console.log("timed out")
                const r = new Roulette(RouletteChannel[1]);
                const win = Roulette.randomWin();

                const arr: { id: string, reward: number }[] = [];
                for (let type in win) {
                    const value = win[type] as RouletteBet;
                    if (value !== undefined) {
                        const winners = r.filter(value).map(player => {
                            var reward = player.bet

                            switch (player.betType) {
                                case "red":
                                    reward *= 2;
                                    break;
                                case "black":
                                    reward *= 2;
                                    break;
                                case "even":
                                    reward *= 2;
                                    break;
                                case "odd":
                                    reward *= 2;
                                    break;
                                case [1, 12]:
                                    reward *= 3;
                                    break;
                                case [13, 24]:
                                    reward *= 3;
                                    break;
                                case [25, 36]:
                                    reward *= 3;
                                    break;
                                default:
                                    reward *= 36;
                                    break;

                            }

                            return {
                                id: player.id,
                                reward
                            }
                        })
                        arr.push(...winners)
                    }
                }
                // console.log("arr:" + arr)
                // console.log("starting giving winners")
                await Promise.all(arr.map(a => changeMoney("dollars", a.id, a.reward)));
                r.clear()
                // console.log("tryin to send win message")
                Embed(msg).setText(arr.length > 0 ? `${arr.map(a => `${msg.guild.members.cache.has(a.id) ? msg.guild.members.cache.get(a.id).user.tag : "Неизвестный"} — ${Currency.dollars.emoji}\`${Util.formatNumber(a.reward)}\``).join("\n")}` : "Ой, никто не победил(").setTitle(`Выпало: ${Roulette.betTypeToString(win.color)}\`${Roulette.betTypeToString(win.num)}\``).send(20 * 1000)
                await this.editMessage(msg)
            }, RouletteGameDuration)
        }
    }

}