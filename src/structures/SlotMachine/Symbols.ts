import { EmojiResolvable } from "discord.js";
import { SLOTS_DEFAULT_JACKPOT } from "../../config";
import { findOrCreateOne, models } from "../../database/db";

export class SlotSymbol {
    readonly adding: number;
    readonly minimum: number = 3;
    
    constructor(
        readonly emoji: EmojiResolvable,
        adding: number,
        readonly chance: number,
        minimum?: number,
        readonly customReward?: (lines: number, userId: string) => Promise<number>,
        /**
         * @returns number of winning text in enum
         */
        readonly customInterface?: (bet?: number) => number,
        
    ) {
        this.adding = Math.round(adding);
        if (minimum) this.minimum = Math.round(minimum);
    }
}

export const SlotSymbols: SlotSymbol[] = [
    new SlotSymbol("🍎", 3, 100),
    new SlotSymbol("🍌", 3, 100), // 2
    new SlotSymbol("🍉", 3, 100), // 2
    new SlotSymbol("🍇", 4, 50), // 3
    new SlotSymbol("🍒", 5, 20, 4), // 4
    new SlotSymbol("<:seven:956788885877301259>", undefined, 5, 5, async (lines, userId) => {
        const bot = await findOrCreateOne("bot", {findOption: "main"});
        const jackpot = Math.round(bot.slotJackpot);
        await models.bot.updateOne({_id: "main"}, {$set: {
            slotJackpot: Math.round(jackpot / 10),
            lastWinner: userId,
            lastWinningJackpot: jackpot * lines,
            winningLines: lines
        }});
        return jackpot * lines;
    }, () => 97)
]