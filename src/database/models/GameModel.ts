import mongoose from "mongoose";
import { Animal, AnimalNames } from "../../docs/animals/Animal";
import { Made_list } from "../../docs/animals/Foods";

export interface madeData {
    name: Made_list,
    count: number
}

export interface AnimalData {
    name: AnimalNames,
    count: number,
    madeGot: Date
}

export interface GameModel {
    _id: string;
    repRewards: { type: Array<string>, default: [] } & string[]
    spaceLevel: { type: number, default: 1 } & number;
    /**
     * Data[]: {count, name, madeGot}
     */
    animals: { type: Array<AnimalData>, default: [] } & Array<AnimalData>;
    madeGot: Date;
    madeData: { type: Array<madeData>, default: {} } & Array<madeData>
}

export const GameModel = mongoose.model("game", new mongoose.Schema<GameModel>({
    _id: String,
    animals: { type: Array, default: [] },
    repRewards: { type: Array, default: [] },
    madeData: { type: Array, default: [] },
    spaceLevel: { type: Number, default: 1 },
    madeGot: Date,
}))