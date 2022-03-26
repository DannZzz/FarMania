import { EmojiResolvable } from "discord.js";
import { Chip, chips } from "./chip";
import { Coin, coins } from "./coin";
import { Dollar, dollars } from "./dollar";

export interface Currency {
    emoji: EmojiResolvable;
}

export const Currency = {
    dollars,
    coins,
    chips
}

export type CurrencyType = Coin | Dollar | Chip;
