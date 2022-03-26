import mongoose from "mongoose";
import { CodeTypes } from "../../structures/RedeemCodes";

export interface CodeModel {
    _id: string;
    users: { type: Array<string>, default: [] } & string[];
    validDate: { type: Date, default: null } & Date;
    maxCount: { type: number, default: null } & number;
    rewardType: CodeTypes & string;
    reward: number
}

export const CodeModel = mongoose.model("redeemcode", new mongoose.Schema<CodeModel>({
    _id: String,
    users: { type: Array, default: [] },
    validDate: { type: Date, default: null },
    maxCount: { type: Number, default: null },
    rewardType: String,
    reward: Number
}))