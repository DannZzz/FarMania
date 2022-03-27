import { EmojiResolvable } from "discord.js";
import { CurrencyType } from "../../currency/Main";
import { Animal } from "../Animal";

export const Bee: Animal = {
    name: "Bee",
    emoji: "<:beehive:950764946180939786>",
    cost: {
        type: "coins",
        amount: 13000
    },
    makingTimeAndLost: "5m",
    family: "insect",
    gives: "honey",
    reputation: 15,
    spaceTake: 5
}