import { ButtonInteraction, MessageButton } from "discord.js";
import { MathGameCollectorTime, Rewards } from "../../config";
import { changeMoney, changeXp } from "../../database/db";
import { Currency } from "../../docs/currency/Main";
import Text, { TextExp } from "../../docs/languages/createText";
import { DateTime } from "../../structures/DateAndTime";
import { Embed } from "../../structures/Embed";
import { Functions } from "../../structures/Functions";
import { InterfaceEdition } from "../../structures/InterfaceEdition";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";
import { delay } from "../category/start";

const listener = new Set();

export default class MathGames extends MessageCommand {
    constructor() {
        super ({
            name: "math",
            description: "math game",
            private: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {

        if (listener.has(msg.author.id)) return;
        listener.add(msg.author.id);
        
        const r = client.util.random;
        var firstNumber = r(1, 15);
        var secondNumber = r(1, 15);

        var oper = client.randomItem(["+", "-", "*", "/"]);

        var result = eval(`${firstNumber} ${oper} ${secondNumber}`);

        var buttons = client.util.shuffle([result, result-r(1, 2), result+r(1, 3), result-r(3, 4)] as number[]).map(res => {
            return new MessageButton().setCustomId(`RES$${res}`).setLabel(`${res}`).setStyle("SECONDARY");
        });

        const m = await Embed(msg).setTitle(DateTime.formatTime(DateTime.getTimeData(MathGameCollectorTime, 0), false, Functions.getTimeLang(sd.language))).setText(`${TextExp(81, sd.language)}: \`${firstNumber} ${oper} ${secondNumber}\`\n\n${TextExp(82, sd.language)}...`).send(undefined, {components: InterfaceEdition.createRows(buttons)});

        const c = m.createMessageComponentCollector({
            filter: i => i.user.id === msg.author.id && buttons.map(b => b.customId).includes(i.customId),
            time: MathGameCollectorTime
        });

        var clicked = false;
        c.on("end", async () => {
            listener.delete(msg.author.id);
            if (!clicked) {
                m.edit({embeds: [Embed(msg).setError(`${TextExp(83, sd.language)} ${result}`)], components: []})
                await delay(10000)
                m.delete()
            }
        })

        c.on("collect", async (b: ButtonInteraction): Promise<any> => {
            await b.deferUpdate();
            clicked = true;
            c.stop();
            const answer = +(b.customId.split("$")[1]);
            if (answer === result) {
                await Promise.all([
                    changeMoney(Rewards.mathGame.type, msg.author.id, Rewards.mathGame.amount),
                    changeXp(msg.author.id, Rewards.mathGame.amount / 200)
                ]);
                
                m.edit({components: [], embeds: [Embed(msg).setSuccess(`${TextExp(84, sd.language)}\n\n${TextExp(73, sd.language)}: ${Currency[Rewards.mathGame.type].emoji}\`${client.util.formatNumber(Rewards.mathGame.amount)}\``)]});
                await delay(10000);
                m.delete();
            } else {
                m.edit({components: [], embeds: [Embed(msg).setError(TextExp(85, sd.language))]});
                await delay(10000);
                m.delete();    
            }
        })
    }
}