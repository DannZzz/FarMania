import { ButtonInteraction, Collector, MessageButton } from "discord.js";
import { DELETE_TIMEOUT_MESSAGES, Rewards } from "../../config";
import { changeMoney, changeXp } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import { TextExp } from "../../docs/languages/createText";
import { CardGame } from "../../structures/CardGame";
import { Embed } from "../../structures/Embed";
import { InterfaceEdition } from "../../structures/InterfaceEdition";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { delay } from "../category/start";

export const CardGameListener = new Set();

export default class CardCommand extends MessageCommand {
    constructor() {
        super({
            name: "card-game",
            description: "card game start",
            private: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        if (CardGameListener.has(msg.author.id)) return;
        CardGameListener.add(msg.author.id);

        const game = new CardGame();

        const buttons: MessageButton[] = [
            new MessageButton()
                .setCustomId("CARD-smaller")
                .setStyle("DANGER")
                .setLabel(TextExp(139, sd.language)),
            new MessageButton()
                .setCustomId("CARD-equal")
                .setStyle("PRIMARY")
                .setLabel(TextExp(140, sd.language)),
            new MessageButton()
                .setCustomId("CARD-bigger")
                .setStyle("SUCCESS")
                .setLabel(TextExp(141, sd.language)),
        ]

        const m = await Embed(msg).setText(TextExp(143, sd.language) + ` ${game.toString(game.card)}\n\n` + TextExp(142, sd.language)).send(undefined, {components: InterfaceEdition.createRows(buttons)});

        const c = m.createMessageComponentCollector({
            filter: i => i.user.id === msg.author.id && buttons.map(b => b.customId).includes(i.customId),
            time: 30000,
            max: 1
        })

        c.on("end", () => {
            CardGameListener.delete(msg.author.id);
            m.delete();
        })

        c.on("collect", async (b: ButtonInteraction) => {
            b.deferUpdate()
            await delay(1500);
            c.stop();
            
            const newCard = game.randomCard();
            
            const sel = b.customId.split("-")[1];
            if (sel === "smaller") {
                if (game.card.card.number > newCard.card.number) {
                    await Promise.all([
                        changeMoney(Rewards.cardGame.other.type, msg.author.id, Rewards.cardGame.other.amount),
                        changeXp(msg.author.id, Rewards.cardGame.other.amount / 100)
                    ])
                    Embed(msg).setSuccess(`${TextExp(143, sd.language)} ${game.toString(game.card)}\n${TextExp(144, sd.language)} ${game.toString(newCard)}\n\n${TextExp(103, sd.language)}: ${Currency[Rewards.cardGame.other.type].emoji}\`${client.util.formatNumber(Rewards.cardGame.other.amount)}\``).send(DELETE_TIMEOUT_MESSAGES * 2)
                } else {
                    Embed(msg).setError(`${TextExp(143, sd.language)} ${game.toString(game.card)}\n${TextExp(144, sd.language)} ${game.toString(newCard)}\n\n${TextExp(145, sd.language)}`).send(DELETE_TIMEOUT_MESSAGES * 2);
                }
            } else if (sel === "equal") {
                if (game.card.card.number === newCard.card.number) {
                    await Promise.all([
                        changeMoney(Rewards.cardGame.equals.type, msg.author.id, Rewards.cardGame.equals.amount),
                        changeXp(msg.author.id, Rewards.cardGame.equals.amount / 100)
                    ])
                    Embed(msg).setSuccess(`${TextExp(143, sd.language)} ${game.toString(game.card)}\n${TextExp(144, sd.language)} ${game.toString(newCard)}\n\n${TextExp(103, sd.language)}: ${Currency[Rewards.cardGame.equals.type].emoji}\`${client.util.formatNumber(Rewards.cardGame.equals.amount)}\``).send(DELETE_TIMEOUT_MESSAGES * 2)
                } else {
                    Embed(msg).setError(`${TextExp(143, sd.language)} ${game.toString(game.card)}\n${TextExp(144, sd.language)} ${game.toString(newCard)}\n\n${TextExp(145, sd.language)}`).send(DELETE_TIMEOUT_MESSAGES * 2);
                }
            } else if (sel === "bigger") {
                if (game.card.card.number < newCard.card.number) {
                    await Promise.all([
                        changeMoney(Rewards.cardGame.other.type, msg.author.id, Rewards.cardGame.other.amount),
                        changeXp(msg.author.id, Rewards.cardGame.other.amount / 100)
                    ])
                    Embed(msg).setSuccess(`${TextExp(143, sd.language)} ${game.toString(game.card)}\n${TextExp(144, sd.language)} ${game.toString(newCard)}\n\n${TextExp(103, sd.language)}: ${Currency[Rewards.cardGame.other.type].emoji}\`${client.util.formatNumber(Rewards.cardGame.other.amount)}\``).send(DELETE_TIMEOUT_MESSAGES * 2)
                } else {
                    Embed(msg).setError(`${TextExp(143, sd.language)} ${game.toString(game.card)}\n${TextExp(144, sd.language)} ${game.toString(newCard)}\n\n${TextExp(145, sd.language)}`).send(DELETE_TIMEOUT_MESSAGES * 2);
                }
            }
        })
        
    }
}