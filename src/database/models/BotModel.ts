import mongoose from "mongoose";
import { SLOTS_DEFAULT_JACKPOT } from "../../config";

export interface BotModel {
    _id: string;
    slotJackpot: { type: number, default: typeof SLOTS_DEFAULT_JACKPOT } & number;
    lastWinner: { type: string, default: null } & string;
    lastWinningJackpot: { type: number, default: null } & number;
}

export const BotModel = mongoose.model("bot", new mongoose.Schema<BotModel>({
    _id: String,
    slotJackpot: { type: Number, default: SLOTS_DEFAULT_JACKPOT },
    lastWinner: { type: String, default: null },
    lastWinningJackpot: { type: Number, default: null }
}))