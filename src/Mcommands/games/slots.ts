import { Client, Util } from "client-discord";
import { ButtonInteraction, MessageButton } from "discord.js";
import { DELETE_TIMEOUT_MESSAGES, ONE_CHIP_IN_DOLLARS, SlotsBets, SLOTS_DEFAULT_JACKPOT, SLOTS_JACKPOT_BOOST } from "../../config";
import { changeMoney, changeXp, findOrCreateOne, models } from "../../database/db";
import { Currency, CurrencyType } from "../../docs/currency/Main";
import { TextExp } from "../../docs/languages/createText";
import { Languages } from "../../docs/languages/language_list";
import { Embed } from "../../structures/Embed";
import { FarmInterface } from "../../structures/FarmInterface";
import { InterfaceEdition } from "../../structures/InterfaceEdition";
import { Listener } from "../../structures/Listener";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { SlotMachine } from "../../structures/SlotMachine/SlotMachine";
import { delay } from "../category/start";

export const SlotListener = new Set();

export default class Slots extends MessageCommand {
    constructor() {
        super({
            name: "slots",
            description: "lol",
            // private: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (SlotListener.has(msg.author.id)) return;
        SlotListener.add(msg.author.id)
        const slot = new SlotMachine(5, 3);
        const buttons: MessageButton[] = SlotsBets.map(bet => new MessageButton().setCustomId(`SLOTBET-${bet}`).setLabel(client.util.formatNumber(bet)).setEmoji(Currency.dollars.emoji).setStyle("SECONDARY"));
        buttons.push(
            new MessageButton()
                .setCustomId("SLOTBET-CHIP")
                .setEmoji(Currency.chips.emoji)
                .setLabel(1 + "")
                .setStyle("PRIMARY")
        )
        const rows = InterfaceEdition.createRows(buttons)

        const defString = async () => (await FarmInterface.moneyInterface(msg.author.id, true)) + "\n\n" + `${await jackpotString(client, sd.language)}` + "\n\n" +slot.stringBoard;
        
        const m = await Embed(msg).setText(await defString()).send(undefined, { components: rows });

        const c = m.createMessageComponentCollector({
            filter: i => i.user.id === msg.author.id && buttons.map(b => b.customId).includes(i.customId),
            time: 30000
        })

        c.on("collect", async (b: ButtonInteraction): Promise<any> => {
            var bet: number;
            var type: CurrencyType = "dollars";
            const sec = b.customId.split("-")[1];
            if (sec === "CHIP") {
                type = "chips"
                bet = ONE_CHIP_IN_DOLLARS;
            } else {
                bet = +sec;
            }
            
            b.deferUpdate();
            c.resetTimer();

            const made = await createSlotBet(msg.author.id, type, bet);
            if (!made) return Embed(msg).setError(`${TextExp(25, sd.language)} ${Currency[type as CurrencyType].emoji}`).send(DELETE_TIMEOUT_MESSAGES);

            slot.updateBoard()
            m.edit({ embeds: [Embed(msg).setText(await defString())], components: [] })
            slot.updateBoard();
            await delay(1000);
            await m.edit({ embeds: [Embed(msg).setText(await defString())], components: [] });
            slot.updateBoard();
            await delay(1000);
            await m.edit({ embeds: [Embed(msg).setText(await defString())], components: [] });
            await delay(1500);
            const win = await createWinning(msg.author.id, sd.language, await slot.getResult(bet, msg.author.id));
            
            m.edit({ embeds: [Embed(msg).setText(await defString() + "\n\n" + `${TextExp(103, sd.language)}: ${win}`)], components: rows });
        })

        c.on("end", () => {
            SlotListener.delete(msg.author.id)
            m.edit({components: InterfaceEdition.createRows(buttons, true)})
        })


    }
}

async function createSlotBet(id: string, type: "dollars" | "chips" , bet: number) {   
    bet = type === "chips" ? 1 : bet;
    const data = await findOrCreateOne("users", {findOption: id});
    if (data[type] < bet) return false;
    await Promise.all([
        changeMoney(type, id, -bet),
        changeXp(id, bet),
        new Listener(id, data).update("Chips", type === "chips" ? 1 : 0),
        models.bot.updateOne({_id: "main"}, {$inc: {slotJackpot: Math.ceil((type === "chips" ?  ONE_CHIP_IN_DOLLARS : bet) * (SLOTS_JACKPOT_BOOST || 1))}})
    ])
    return true;
}

async function createWinning (id: string, lang: Languages, win: {amount: number, customs?: number[]}) {
    var texts: string[] = []
    var am = win.amount
    if (win.amount > 0) await changeMoney("dollars", id, win.amount); 
    texts.push(`${Currency.dollars.emoji}\`${Util.formatNumber(am)}\``);

    if (win?.customs?.length > 0) {
        win.customs.forEach(number => texts.push(TextExp(number, lang)));
    }

    return texts.join("\n");
}

export async function jackpotString(client: Client, lang: Languages) {
    const d = await findOrCreateOne("bot", {findOption: "main"});
    var last = "";
    if (d.lastWinner) {
        const user = await client.users.fetch(d.lastWinner);
        last = `\n👑 **${user ? user.tag : TextExp(57, lang)}** ${TextExp(104, lang)} ${Currency.dollars.emoji}\`${client.util.formatNumber(d.lastWinningJackpot || SLOTS_DEFAULT_JACKPOT)}\` **x${d.winningLines || 1}**`
    }
    
    return `${TextExp(102, lang)} ${TextExp(97, lang)}: ${Currency.dollars.emoji}\`${client.util.formatNumber(d.slotJackpot)}\`${last}`
}