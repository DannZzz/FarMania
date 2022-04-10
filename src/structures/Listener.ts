import { findOrCreateOne, models } from "../database/db";
import { UserModel } from "../database/models/UserModel";
import { AchievementName } from "../docs/levels/achievemets";

export class Listener {;
    readonly userId: string;
    private listeners: {[k: string]: number};
    
    /**
     * New Listener 
     * 
     * @param {string} id user id
     * @param {UserModel} model userModel
     * @description
     * UserModel.listeners = {}
     */
    constructor(id: string, model: UserModel) {
        this.userId = id;
        this.listeners = model.listener;
    }

    async update(key: AchievementName): Promise<void>;
    async update(key: AchievementName, count: number): Promise<void>;
    async update(key: AchievementName, count?: number): Promise<void> {
        const _c = count || 0;
        const value = this._getKey(key);
        if (value === undefined) {
            await models.users.updateOne({_id: this.userId}, {$set: {[`listener.${key}`]: _c}});
        } else {
            await models.users.updateOne({_id: this.userId}, {$inc: {[`listener.${key}`]: _c}});
        }
    }

    /**
     * Get listener data
     * 
     * @param {string} key key of Listeners Object
     * @param {boolean} onlyNumber get value as number, altough its not exist
     */
    get(key: AchievementName): number;
    get(key: AchievementName, onlyNumber: boolean): number;
    get(key: AchievementName, onlyNumber?: boolean): number {
        const value = this._getKey(key);
        if (value || value === 0) return value;
        if (onlyNumber) return 0;
        return undefined;
    }

    /**
     * Reset listeners to 0
     * 
     * @param {string | string[]} key reset values to 0
     */
    async reset(key: AchievementName | string[]) {
        const keys = Array.isArray(key) ? key : [key];
        await Promise.all(keys.map(async key => await models.users.updateOne({_id: this.userId}, {$set: {[`listener.${key}`]: 0} })))
    }

    private _getKey(key: AchievementName): number | undefined {
        return this.listeners[key];
    }
} 
