import { Client } from "client-discord";
import { stripIndents } from "common-tags";
import { Guild, Message, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { colors, RouletteBets } from "../../config";
import { findOrCreateOne, models } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import Chest from "../Chest";
import { DateTime } from "../DateAndTime";
import { Functions } from "../Functions";
import { InterfaceEdition } from "../InterfaceEdition";
import { Airplane } from "./Airplane";

const messages = new Chest<string, Message>();

export class AirplaneGame {
    constructor(private readonly client: Client) {
    }

    async getMessage(guildId: string): Promise<Message> {
        try {
            const bot = await findOrCreateOne("bot", { findOption: "main" });
            const planes = bot.airplanes;
            const thisGuild = planes.find(p => p.guild === guildId && p.channel);
            if (!thisGuild) return undefined;
            const g = await this.client.guilds.fetch(thisGuild.guild);
            if (!g) return undefined;
            const channel = await g.channels.fetch(thisGuild.channel) as TextChannel;
            if (!channel) return undefined;
            const msg = await channel.messages.fetch(thisGuild.message);
            if (!msg || !(msg instanceof Message)) return undefined;
            return msg;
        } catch (e) {
            console.log(e)
            return undefined;
        }

    }

    async updateMessages() {
        const bot = await findOrCreateOne("bot", { findOption: "main" });
        const planes = bot.airplanes;
        for (let data of planes) {
            if (!data.channel || !data.guild) continue;
            try {
                const guild = await this.client.guilds.fetch(data.guild);
                const index = planes.findIndex(p => p.guild === guild.id);
                if (!guild) continue;
                const channel = await guild.channels.fetch(data.channel) as TextChannel;
                if (!channel) continue;
                var message: Message;
                try {
                    message = data.message ? await channel.messages.fetch(data.message) : undefined;
                } catch {}

                const messageData = await this.defaultEmbed(guild, channel.id);
                if (!message) {

                    const msg = await channel.send({ embeds: [messageData.embed], components: InterfaceEdition.createRows(messageData.buttons) });
                    messages.set(channel.id, msg);
                    await models.bot.updateOne({ _id: "main" }, { $set: { [`airplanes.${index}`]: { guild: guild.id, channel: channel.id, message: msg.id } } });

                } else {
                    messages.set(channel.id, message);
                    await message.edit({ embeds: [messageData.embed], components: InterfaceEdition.createRows(messageData.buttons) })
                }

            } catch (e) {
                console.log(e)
                continue;
            }

        }
    }

    async startAndEdit(guildId: string, channelId: string ) {
        const message = messages.get(channelId);
        // console.log(message)
        if (!message) return;
        const p = new Airplane(message.channelId);
        // console.log(p.game.status)
        if (!p.game.timeout || p.game.timeout <= new Date()) {
            if (p.game.status === "collecting" || p.game.status === "ended") {
                // console.log(p)
                p.switchStatus(p.nextStatus);
                p.newTimeout(p.nextTimeout);
                // console.log(p)
                // console.log(new Airplane(message.channelId))
            } else if (p.game.status === "flying") {
                // console.log("else")
                if (this.client.util.random(1, 100) <= 80) {
                    // console.log(1)
                    p.addToNumber(0.1);
                } else {
                    // console.log(2)
                    p.addToNumber(0)
                    p.switchStatus(p.nextStatus);
                    p.newTimeout(p.nextTimeout);
                }
            }
            
        }

        const data = await this.defaultEmbed(message.guild, message.channelId);

        await message.edit({ embeds: [data.embed], components: InterfaceEdition.createRows(data.buttons) })

    }

    async defaultEmbed(guild: Guild, channeId: string) {
        const p = new Airplane(channeId);
        var text: string;

        const buttons: MessageButton[] = [];

        const bets = async () => {
            const bets: string[] = [];
            for (let data of p.game.users) {
                var name = "Неизвестный";
                try {
                    name = (await guild.members.fetch(data.id)).user.tag;
                } catch { }
                bets.push(`${name} — ${Currency.dollars.emoji}\`${this.client.util.formatNumber(data.bet)}\``);
            }
            return bets;
        }


        if (p.game.status === "collecting") {
            RouletteBets.forEach(number => {
                number *= 2;
                buttons.push(new MessageButton().setCustomId("AIRPLANEBET-" + number).setEmoji(Currency.dollars.emoji).setLabel(this.client.util.formatNumber(number)).setStyle("SECONDARY"));
            })

            text = "Собираем пассажиров, делайте ваше ставки, самолёт взлетит через: \`" + DateTime.formatTime(DateTime.getTimeData(p.game.timeout.getTime()), false, Functions.getTimeLang("ru")) + "\`";
            text = text + "\n\nПассажиры:\n" + (await bets()).join("\n");
        } else if (p.game.status === "ended") {
            text = "Самолёт улетел!\nСледующий самолёт через: \`" + DateTime.formatTime(DateTime.getTimeData(p.game.timeout.getTime()), false, Functions.getTimeLang("ru")) + "\`";
        } else if (p.game.status === "flying") {
            text = "Высота самолёта: \`" + p.game.thisNumber.toFixed(1) + "\`\n\n Забирай ставку и умножь!";
            buttons.push(new MessageButton().setCustomId("TAKEAIRPLANEBET").setLabel("Забрать x"+this.client.util.formatNumber(p.game.thisNumber)).setStyle("PRIMARY"))
        }

        const a = {
            embed: new MessageEmbed()
                .setColor(colors.main)
                .setThumbnail("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.k4IWYA1hkynogeqHBytx0AHaEK%26pid%3DApi&f=1")
                .setTitle("Авиатор")
                .setDescription(stripIndents`
                Умножь свои ставки до вылета!
                ${text}
            `),
            buttons
        }
        return a
    }
}