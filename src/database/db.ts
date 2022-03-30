import { ServerModel } from "./models/ServerModel";
import { Document } from "mongoose";
import { GameModel } from "./models/GameModel";
import { Translation, UserModel } from "./models/UserModel";
import { CurrencyType } from "../docs/currency/Main";
import { BotModel } from "./models/BotModel";
import { CodeModel } from "./models/CodeModel";
import { OneDay, TRANSLATION_ADD_PER_LEVEL, TRANSLATION_DEFAULT } from "../config";
import { findLevel } from "../docs/levels/levels";

export interface models {
    servers: ServerModel
    games: GameModel
    users: UserModel
    bot: BotModel
    redeemcodes: CodeModel
}

export const models = {
    servers: ServerModel,
    games: GameModel,
    users: UserModel,
    bot: BotModel,
    redeemcodes: CodeModel,
};

export async function findOrCreateOne<T extends keyof models, V extends models[T], R extends Pick<V & Document, keyof V>>(model: T, options: {findOption: string, findField?: keyof V, denyCreation?: boolean} ): Promise<R> {
    const schema = await models[model].findOne({[options.findField ? options.findField : "_id"]: options.findOption});
    if (schema) return schema as any;
    if (!options.denyCreation && (!options.findField || options.findField === "_id")) {
        const newData = await models[model].create({
            _id: options.findOption
        });
        await newData.save();
        return newData as any;
    }
    return schema as any;
}

/**
 * Change user's coins from database
 * 
 * @param type type of money
 * @param id User id
 * @param amount amount to change
 * @param dontRound Dont round amount ↑
 */
export async function changeMoney<T extends CurrencyType>(type: T, id: string, amount: number): Promise<void>; 
export async function changeMoney<T extends CurrencyType>(type: T, id: string, amount: number, dontRound: boolean): Promise<void>;
export async function changeMoney<T extends CurrencyType>(type: T, id: string, amount: number, dontRound?: boolean): Promise<void> {
    await Promise.all([
        findOrCreateOne("users", {findOption: id}),
        await models.users.updateOne({_id: id}, {$inc: {[type]: dontRound ? amount : Math.round(amount)}})
    ])
}

/**
 * Change user's xp
 * 
 * @param id userId
 * @param amount amount to change
 * @param dontRound Dont round amount ↑
 */
export async function changeXp(id: string, amount: number): Promise<void>;
export async function changeXp(id: string, amount: number, dontRound: boolean): Promise<void>;
export async function changeXp(id: string, amount: number, dontRound?: boolean): Promise<void> {
    await Promise.all([
        findOrCreateOne("users", {findOption: id}),
        await models.users.updateOne({_id: id}, {$inc: {xp: dontRound ? amount : Math.round(amount)}})
    ])
}

/**
 * Update or get user translation informations
 * 
 * @param id user id
 * @param action get user translations amount or update it
 */
export async function translations (id: string, action: boolean): Promise<{sent: number, available: number}>;
export async function translations (id: string, action: Translation): Promise<void>;
export async function translations (id: string, action: boolean | Translation): Promise<{sent: number, available: number} | void> {
    if (typeof action === "boolean") {
        const data = await findOrCreateOne("users", {findOption: id});
        const arr = (data.translations || []) as Translation[];
        const filtered = arr.filter(tr => tr.date.getTime() + OneDay >= Date.now());

        const levels = findLevel(data.xp || 0);
        return {
            sent: filtered.reduce((aggr, tr) => aggr + (tr.amount || 0), 0),
            available: TRANSLATION_DEFAULT + TRANSLATION_ADD_PER_LEVEL * levels.currentLevel
        }        
    } else {
        await models.users.updateOne({_id: id}, {$push: {translations: action}});
    }
}

export async function hasMoney (id: string, amount: number): Promise<boolean>;
export async function hasMoney (id: string, amount: number, type: CurrencyType): Promise<boolean>;
export async function hasMoney (id: string, amount: number, type: CurrencyType = "dollars"): Promise<boolean> {
    const user = await findOrCreateOne("users", {findOption: id, denyCreation: true});
    if (!user) return false;
    return user[type] >= amount
}