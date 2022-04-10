import { Util } from "client-discord";
import { Message } from "discord.js";
import { DELETE_TIMEOUT_MESSAGES } from "../config";
import { changeMoney, findOrCreateOne, models } from "../database/db";
import { AnimalData } from "../database/models/GameModel";
import { AnimalNames } from "../docs/animals/Animal";
import { Animals } from "../docs/animals/Animals_list";
import { Currency, CurrencyType } from "../docs/currency/Main";
import Text, { TextExp } from "../docs/languages/createText";
import { Languages } from "../docs/languages/language_list";
import { AchievementName, Achievements, findAchievement, updateDefault } from "../docs/levels/achievemets";
import ChangeAnimals from "../Mcommands/developer/changeAnimals";
import { Embed } from "./Embed";
import { FarmInterface } from "./FarmInterface";
import { Listener } from "./Listener";

export class Functions {

    /**
     * Get all animals reputation
     * 
     * @param array GameModel.animals
     * @returns reputation
     */
    static calculateReputation(array: AnimalData[]): number {
        var rep = 0;
        array.forEach(d => rep += (Animals[d.name].reputation || 0) * d.count);
        return rep;
    }
    
    /**
     * Get shorten times in need lang
     * 
     * @param lang short-language
     * @returns ["ms", "s", "m", "h", "d"]
     */
    static getTimeLang(lang: Languages): [string, string, string, string, string] {
        return [TextExp(38, lang), TextExp(39, lang), TextExp(40, lang), TextExp(41, lang), TextExp(42, lang)]
    }

    /**
     * Find Level of achievemet
     * 
     * @param {AchievementName} name achievement name for base
     * @param {number} number our stats
     * @returns level of done achievements
     */
    static findEqualAchievementLevel (name: AchievementName, number: number): number {
        const achievement = findAchievement(name);
        if (!achievement) return null;
        const index = achievement.list.findIndex(l => l.need > number);
        if (index === -1) return achievement.list.length;
        return index;
    }

    /**
     * Give rewards while its able
     * 
     * @param {Message} msg Message
     * @param {string} id user id
     * @param {AchievementName} name achievement name
     * @param {number} level number
     * @param {number} baseLevel number
     */
    static async updateWhileDoneAchievemt (msg: Message, id: string, name: AchievementName, level: number, baseLevel: number): Promise<void> {
        const ach = findAchievement(name);
        if (!ach) return;
        // baseLevel 2
        // level 3
        for (let i = 0; i < level; i++) {
            if (i >= baseLevel) await this.achievementReward(msg, id, name, i);
        }
    }

    /**
     * Check if there are some done achievements
     * 
     * @param {string} id user id
     * @returns {boolean} boolean
     */
    static async checkAllAchievements (id: string): Promise<boolean> {
        const data = await findOrCreateOne("users", {findOption: id});
        const l = new Listener(id, data);
        let arr = [];
        // baseLevel 2
        // level 3
        for (let ach of Achievements) {
            const number = l.get(ach.name, true);
            const level = this.findEqualAchievementLevel(ach.name, number);
            // console.log(`level ${ach.name}: ${level}`)
            // console.log(`number ${ach.name}: ${number}`)
            let baseLevel: number;
            const achievement = data.achievements.find(a => a.name === ach.name);
            if (!achievement) {
                baseLevel = 0;
            } else {
                baseLevel = achievement.level
            }

            for (let i = 0; i < level; i++) {
                if (i >= baseLevel) arr.push(`${ach.name}: ${i}`);
            }
            
        }
        // console.log(arr)
        return arr.length > 0
    }

    /**
     * Give achievemet reward
     * 
     * @param {Message} msg Message
     * @param {string} id user id
     * @param {AchievementName} name achievement name
     * @param {number} level achievement level
     */
    static async achievementReward (msg: Message, id: string, name: AchievementName, level: number) {
        const ach = findAchievement(name);
        await updateDefault(id);
        const d = await findOrCreateOne("users", {findOption: id});
        if (ach) {
            const index = d.achievements.findIndex(a => a.name === name);
            if (index === -1) {
                await models.users.updateOne({_id: id}, {$push: {achievements: {name, level: level + 1} }})
            } else {
                await models.users.updateOne({_id: id}, {$set: {[`achievements.${index}.level`]: level + 1 }})
            }
            const l = ach.list[level];
            if (l) {
                if (Currency[l.reward]) {
                    await changeMoney(l.reward as CurrencyType, id, l.rewardAmount);
                    Embed(msg).setSuccess(await Text(65, msg.guildId) + ` ${Currency[l.reward].emoji}\`${Util.formatNumber(l.rewardAmount)}\``).send(DELETE_TIMEOUT_MESSAGES * 1.5)
                } else {
                    await FarmInterface.changeAnimalCountInData(id, l.reward as AnimalNames, l.rewardAmount);
                    Embed(msg).setSuccess(await Text(65, msg.guildId) + ` ${Animals[l.reward].emoji}\`${Util.formatNumber(l.rewardAmount)}\``).send(DELETE_TIMEOUT_MESSAGES * 1.5)
                }
            }
        }
    }
}