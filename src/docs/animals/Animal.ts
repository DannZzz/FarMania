import { EmojiResolvable } from "discord.js";
import { CurrencyType } from "../currency/Main";
import { Made, Made_list } from "./Foods";

export interface Animal {
    readonly name: AnimalNames;
    readonly emoji: EmojiResolvable;
    readonly makingTimeAndLost?: string;
    readonly family: AnimalFamily;
    readonly special?: true;
    readonly cost: {
        type: CurrencyType;
        amount: number
    };
    readonly gives?: Made_list;
    readonly reputation: number;
    readonly spaceTake: number;
    readonly needLevel?: number;
    readonly donate?: {
        type: "RUB",
        amount: number
    }
}

export type AnimalFamily = "insect" | "cattle" | "reptile" | "vip" | "predator" | "ocean";

export type AnimalNames = 
"Bee" |
"Cow" | 
"Crocodile" | 
"Pig" |
"Sheep" |
"Dog" |
"Zebra" |
"Hippo" |
"Komodo" |
"Tiger" |
"WhiteTiger" |
"Shark" |
"Dolphin" |
"Elephant" |
"Velociraptor" |
"Unicorn"
