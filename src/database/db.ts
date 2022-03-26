import { ServerModel } from "./models/ServerModel";
import { Document } from "mongoose";
import { GameModel } from "./models/GameModel";
import { UserModel } from "./models/UserModel";
import { CurrencyType } from "../docs/currency/Main";
import { BotModel } from "./models/BotModel";
import { CodeModel } from "./models/CodeModel";

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
