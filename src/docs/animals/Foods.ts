import { EmojiResolvable } from "discord.js"
import ms from "ms";
import { CurrencyType } from "../currency/Main";
import { Animal, AnimalNames } from "./Animal";
import { Animals } from "./Animals_list";

type FoodType = {[k: string]: {
    emoji: EmojiResolvable;
    cost: {
        type: CurrencyType;
        amount: number;
    },
}}

export type Made = FoodType
export const Made = {
    unicorn_horn: {
        emoji: "<:unicorn_horn:960881768116940810>",
        cost: {
            type: "coins" as CurrencyType,
            amount: 1_500_000
        }
    },
    shark_trunk: {
        emoji: "<:shark_trunk:958750276599300187>",
        cost: {
            type: "coins" as CurrencyType,
            amount: 350000
        }
    },
    white_tiger_skin: {
        emoji: "<:white_tiger_skin:956968047078420530>",
        cost: {
            type: "dollars" as CurrencyType,
            amount: 1
        }
    },
    tiger_skin: {
        emoji: "<:tiger_skin:956968047678226452>",
        cost: {
            type: "coins" as CurrencyType,
            amount: 40000
        }
    },
    komodo_skin: {
        emoji: "<:komodo_skin:956965685098078258>",
        cost: {
            type: "coins" as CurrencyType,
            amount: 33000
        }
    },
    wool: {
        emoji: "<:woolball:956212569549467658>",
        cost: {
            type: "coins" as CurrencyType,
            amount: 1350
        }
    },
    meat: {
        emoji: "🍖",
        cost: {
            type: "coins" as CurrencyType,
            amount: 2100
        }
    },
    honey: {
        emoji: "🍯",
        cost: {
            type: "coins"  as CurrencyType,
            amount: 400
        }
    },
    milk: {
        emoji: "🥛",
        cost: {
            amount: 1300,
            type: "coins" as CurrencyType
        }
    },
    croc_skin: {
        emoji: "<:croc_skin:952580680234176544>",
        cost: {
            amount: 20000,
            type: "coins"  as CurrencyType
        }
    }
}

export type Made_list = keyof typeof Made

/**
 * Calculate how many items mades an animal for the time
 * 
 * @param animalName animal name ex. Bee
 * @param lastCollectedDate date ex. new Date()
 */
export function calculateMadeCount (animalName: AnimalNames, lastCollectedDate: Date): number;
export function calculateMadeCount (animalName: AnimalNames, lastCollectedDate: Date, animals: number): number;
export function calculateMadeCount (animalName: AnimalNames, lastCollectedDate: Date, animals?: number): number {
    const time = Math.round((Date.now() - lastCollectedDate.getTime()) / 1000); // seconds
    const animal = Animals[animalName] as Animal;
    const makingCountTimeInSeconds = Math.round(ms(animal.makingTimeAndLost) / 1000)
    return makingCountTimeInSeconds <= time ? Math.floor(time / makingCountTimeInSeconds * (typeof animals !== "undefined" ? animals : 1) ) : 0;
}
