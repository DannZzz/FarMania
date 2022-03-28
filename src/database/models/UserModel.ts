import mongoose from "mongoose";

export interface UserModel {
    _id: string;
    cooldowns: { type: Object, default: {[k: string]: Date} } & {[k: string]: Date};
    coins: { type: number, default: 10000 } & number;
    dollars: { type: number, default: 10 } & number;
    chips: { type: number, default: 10 } & number;
    dailyLine: { type: number, default: 1 } & number;
    lastDaily: Date;
    ban: { type: Date, default: null } & Date;
}

export const UserModel = mongoose.model("user", new mongoose.Schema<UserModel>({
    _id: String,
    cooldowns: { type: Object, default: {} },
    coins: { type: Number, default: 10000 },
    dollars: { type: Number, default: 10 },
    chips: { type: Number, default: 10 },
    dailyLine: { type: Number, default: 1 },
    lastDaily: Date,
    ban: { type: Date, default: null },
}))