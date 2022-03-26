import { MessageActionRow, MessageButton } from "discord.js";
import { DELETE_TIMEOUT_MESSAGES, Rewards, TicTacToeCooldown } from "../../config";
import { changeMoney, findOrCreateOne, models } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import { TextExp } from "../../docs/languages/createText";
import { DateTime } from "../../structures/DateAndTime";
import { Embed } from "../../structures/Embed";
import { Functions } from "../../structures/Functions";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { TicTacToe } from "../../structures/TicTacToe/Game";

export default class TTT extends MessageCommand {
    constructor() {
        super({
            name: "tictactoe",
            aliases: ["ttt"],
            cooldown: 5,
            private: true,
            description: "tic tac toe"
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        const users = [msg.author.id];
        if (args[0]) {
            const member = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
            if (!member || member.user.bot || member.id === msg.author.id) {
                return Embed(msg).setError(TextExp(76, sd.language)).send(DELETE_TIMEOUT_MESSAGES);
            } else {
                users.push(member.id)
            };
        }
        const gameCooldown = (await findOrCreateOne("users", {findOption: msg.author.id}))?.cooldowns || {} as {[k: string]: Date}
        
        const game = new TicTacToe(users);
        if (users.length === 1) {
            if (game.exists("AI")) {
                return;
            } else {
                game.updateData("AI")
            }
        } else {
            if (gameCooldown?.ttt >= new Date()) {
                return Embed(msg).setError(`${TextExp(80, sd.language)} \`${DateTime.formatTime(DateTime.getTimeData(gameCooldown?.ttt.getTime()), false, Functions.getTimeLang(sd.language))}\``);
            }
            if (game.exists("USER")) {
                return;
            } else {
                game.updateData("USER")
            }
        }

        const Text = game.turnString();
        const buttons = game.boardToButtons();
        function createRows(buttons: MessageButton[]) {
            const rows: MessageActionRow[] = [];
            for (let i = 0; i < buttons.length; i += 3) {
                rows.push(new MessageActionRow().addComponents(buttons.slice(i, i + 3)))
            }
            return rows;
        }
        const rows = createRows(buttons);
        const m = await Embed(msg).setText(Text).send(undefined, { components: rows });
        await check(game, game.step);
        async function check(g: TicTacToe, turn: typeof game.step) {
            if (g[turn] === "A.I") {
                await delay(3000)
                const ended = g.aiStep();
                if (ended && ended !== "tie") {
                    if (users.length === 1) g.updateData("AI", true);
                    if (users.length === 2) g.updateData("USER", true);
                    stopped = true;
                    if (g.winner !== "A.I") await changeMoney(Rewards.ttt.type, g.winner, (g.S === "A.I" ? Rewards.ttt.amount : Rewards.ttt.amountAgainsMember));
                    return await m.edit({ embeds: [Embed(msg).setText(`${TextExp(71, sd.language)}: ${g.winner === "A.I" ? `**${g.winner}**` : `<@${g.winner}>`}\n\n${TextExp(73, sd.language)}: ${Currency[Rewards.ttt.type].emoji}\`${client.util.formatNumber((g.S === "A.I" ? Rewards.ttt.amount : Rewards.ttt.amountAgainsMember))}\``)], components: [] })
                } else if (ended) {
                    if (users.length === 1) g.updateData("AI", true);
                    if (users.length === 2) g.updateData("USER", true);
                    stopped = true;
                    return await m.edit({ embeds: [Embed(msg).setText(`${TextExp(72, sd.language)}`)], components: [] })
                }
                stopped = true;
                await m.edit({ embeds: [Embed(msg).setText(g.turnString())], components: createRows(g.boardToButtons()) });
                await check(g, g.step);
                return;
            }

            const c = m.createMessageComponentCollector({
                filter: i => i.user.id === (g.step === "First" ? g.F : g.S) && buttons.map(b => b.customId).includes(i.customId),
                time: 100000
            });
            var stopped = false;
            c.on("end", () => {
                if (!stopped) m.edit({ components: [] });
            });

            c.on("collect", async (i): Promise<any> => {
                await i.deferUpdate();
                const row = +i.customId.split("-")[0];
                const column = +i.customId.split("-")[1];

                if (g.board[row][column]) {
                    c.resetTimer();
                } else {
                    const ended = g.changeBlock(row, column);
                    if (ended && ended !== "tie") {
                        stopped = true;
                        if (users.length === 1) g.updateData("AI", true);
                        if (users.length === 2) g.updateData("USER", true);
                        c.stop();
                        if (g.winner !== "A.I") await changeMoney(Rewards.ttt.type, g.winner, (g.S === "A.I" ? Rewards.ttt.amount : Rewards.ttt.amountAgainsMember));
                        return await m.edit({ embeds: [Embed(msg).setText(`${TextExp(71, sd.language)}: ${g.winner === "A.I" ? `**${g.winner}**` : `<@${g.winner}>`}\n\n${TextExp(73, sd.language)}: ${Currency[Rewards.ttt.type].emoji}\`${client.util.formatNumber((g.S === "A.I" ? Rewards.ttt.amount : Rewards.ttt.amountAgainsMember))}\``)], components: [] })
                    } else if (ended) {
                        stopped = true;
                        c.stop();
                        if (users.length === 1) g.updateData("AI", true);
                        if (users.length === 2) g.updateData("USER", true);
                        return await m.edit({ embeds: [Embed(msg).setText(`${TextExp(72, sd.language)}`)], components: [] })
                    }
                    stopped = true;
                    if (g.getEmptyBlocks().length <= 7 && g.S !== "A.I" && (!gameCooldown.ttt || gameCooldown.ttt < new Date())) await models.users.updateOne({_id: g.F}, {$set: {"cooldowns.ttt": new Date(Date.now() + TicTacToeCooldown)}}) 

                    await m.edit({ embeds: [Embed(msg).setText(g.turnString())], components: createRows(g.boardToButtons()) });
                    c.stop();
                    await check(g, g.step);
                }

            })
        }

    }
}

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}