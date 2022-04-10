import { Currency, CurrencyType } from "../currency/Main";
import { AnimalNames } from "../animals/Animal";
import { EmojiResolvable } from "discord.js";
import { Animals } from "../animals/Animals_list";
import { findOrCreateOne, models } from "../../database/db";
export type AchievementName = "Chips" | "Elephant";

export type Achievements = ReadonlyArray<{
    name: AchievementName;
    textIndex: number;
    emoji: EmojiResolvable;
    animal?: boolean;
    disabled?: boolean;
    list: [{need: number, reward: CurrencyType | AnimalNames, rewardAmount: number}, {need: number, reward: CurrencyType | AnimalNames, rewardAmount: number}, {need: number, reward: CurrencyType | AnimalNames, rewardAmount: number}]
}>

export const Achievements: Achievements = [
    {
        name: "Elephant",
        animal: true,
        textIndex: 30,
        emoji: Animals.Elephant.emoji,
        list: [
            {
                need: 300,
                reward: "dollars",
                rewardAmount: 3500
            },
            {
                need: 500,
                reward: "dollars",
                rewardAmount: 6500
            },
            {
                need: 1000,
                reward: "dollars",
                rewardAmount: 20000
            }
        ]
    },
    {
        name: "Chips",
        textIndex: 149,
        emoji: Currency.chips.emoji,
        list: [
            {
                need: 50, // 50
                reward: "dollars",
                rewardAmount: 1000
            },
            {
                need: 250, // 250
                reward: "dollars",
                rewardAmount: 5000
            },
            {
                need: 1000, // 1000
                reward: "Unicorn",
                rewardAmount: 3
            }
        ]
    }
];

/**
 * Find achievement by name
 * 
 * @param {AchievementName} name achievement name
 * @returns {Achievements}
 */
export function findAchievement(name: AchievementName) {
    return Achievements.find(a => a.name === name);
}

export async function updateDefault (id: string) {
    const data = await findOrCreateOne("users", {findOption: id});
    if (!data.listener) await models.users.updateOne({_id: id}, {$set: {listener: {}}});
    if (!data.achievements) await models.users.updateOne({_id: id}, {$set: {achievements: []}});
}