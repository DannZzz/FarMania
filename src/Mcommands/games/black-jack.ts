import { stripIndents } from "common-tags";
import { ButtonInteraction, MessageButton } from "discord.js";
import { DELETE_TIMEOUT_MESSAGES, TIME_TO_CHANGE_PARAMETER } from "../../config";
import { changeMoney, findOrCreateOne } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import { TextExp } from "../../docs/languages/createText";
import { BlackJack } from "../../structures/BlackJack";
import { Embed } from "../../structures/Embed";
import { InterfaceEdition } from "../../structures/InterfaceEdition";
import { Listener } from "../../structures/Listener";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { delay } from "../category/start";

export default class BlackJackCommand extends MessageCommand {
    constructor() {
        super({
            name: "blackjack",
            aliases: ["bj"],
            description: "blackjack game",
            private: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        async function lol (bet: number = 50) {
            const l = new Listener(msg.author.id, await findOrCreateOne("users", {findOption: msg.author.id}));
            await l.update("Blackjack", 1);
            const game = new BlackJack(msg.author.id, bet);

            // Embed
            const makeInterface = () => Embed(msg).setText(TextExp(game.step === "_player" ? 153 : 154, sd.language)).addField(`${msg.author.username}: ${game.sum("_player")}`, game.cardsToString().player, true).addField(`${TextExp(164, sd.language)}: ${game.sum("_bot")}`, game.cardsToString().bot, true);

            // Buttons
            const buttons = [
                new MessageButton()
                    .setCustomId("OneMoreCard")
                    .setStyle("PRIMARY")
                    .setLabel(TextExp(155, sd.language)),
                new MessageButton()
                    .setCustomId("EnoughCards")
                    .setStyle("SECONDARY")
                    .setLabel(TextExp(156, sd.language))
            ];
            const row = InterfaceEdition.createRows(buttons);

            // bot's first card
            game.addCard();

            // switch turn
            game.switch();

            // user's first card
            game.addCard();

            // message
            const m = await (makeInterface()).send(undefined, { components: row });

            const c = m.createMessageComponentCollector({
                filter: i => i.user.id === msg.author.id && buttons.map(b => b.customId).includes(i.customId),
                time: TIME_TO_CHANGE_PARAMETER
            })

            c.on("end", async (b) => {
                game.stop();
                m.edit({components: InterfaceEdition.createRows(buttons, true)});
                await delay(DELETE_TIMEOUT_MESSAGES * 2);
                m.delete()
            })

            c.on("collect", async (b: ButtonInteraction): Promise<any> => {
                b.deferUpdate()
                c.resetTimer();
                if (buttons[0].customId === b.customId) {
                    game.addCard()
                    const w = game.checkWin();
                    await m.edit({ embeds: [makeInterface()] });

                    if (w === true) {
                        
                        c.stop();
                        const reward = game.calculateReward();
                        await changeMoney("dollars", msg.author.id, reward);
                        return Embed(msg).setSuccess(TextExp(157, sd.language) + "\n" + TextExp(65, sd.language) + ` ${Currency.dollars.emoji}\`${client.util.formatNumber(reward)}\``).send(DELETE_TIMEOUT_MESSAGES * 2);
                    } else if (w === false) {
                        
                        c.stop();
                        return Embed(msg).setError(TextExp(145, sd.language)).send(DELETE_TIMEOUT_MESSAGES * 2);
                    }
                } else {
                    c.stop();
                    game.switch();
                    await delay(1500);
                    await m.edit({ embeds: [makeInterface()] });

                    while (game.bot.size === 1 || (game.bot.size <= 3 && BlackJack.randomChance() && game.sum("_bot") < 18) || (game.sum("_bot") < 11)) {
                        await delay(2000)
                        if (game.sum("_player") < game.sum("_bot")) break;
                        game.addCard()
                        const w = game.checkWin();
                        await m.edit({ embeds: [makeInterface()] });

                        if (w === false) {
                            c.stop();
                            const reward = game.calculateReward();
                            await changeMoney("dollars", msg.author.id, reward);
                            return Embed(msg).setSuccess(TextExp(158, sd.language) + "\n" + TextExp(65, sd.language) + ` ${Currency.dollars.emoji}\`${client.util.formatNumber(reward)}\``).send(DELETE_TIMEOUT_MESSAGES * 2);
                        } else if (w === true) {
                            c.stop()
                            return Embed(msg).setError(TextExp(161, sd.language) + "\n" + TextExp(145, sd.language)).send(DELETE_TIMEOUT_MESSAGES * 2);
                        }

                    }

                    const win = game.winner()
                    
                    if (win === true) {
                        const reward = game.calculateReward();
                        await changeMoney("dollars", msg.author.id, reward);
                        return Embed(msg).setSuccess(TextExp(159, sd.language) + "\n" + TextExp(65, sd.language) + ` ${Currency.dollars.emoji}\`${client.util.formatNumber(reward)}\``).send(DELETE_TIMEOUT_MESSAGES * 2);
                    } else if (win === false) {
                        return Embed(msg).setError(TextExp(160, sd.language)).send(DELETE_TIMEOUT_MESSAGES * 2);
                    } else {
                        await changeMoney("dollars", msg.author.id, bet);
                        return Embed(msg).setSuccess(TextExp(72, sd.language) + "\n" + TextExp(65, sd.language) + ` ${Currency.dollars.emoji}\`${client.util.formatNumber(bet)}\``).send(DELETE_TIMEOUT_MESSAGES * 2);
                    }

                }
            })

        }
        return lol;
    }

}