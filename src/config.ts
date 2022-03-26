import { ColorResolvable, EmojiResolvable, UserResolvable } from "discord.js";
import { CurrencyType } from "./docs/currency/Main";

// ---------------------- TOKEN ----------------------
export const TOKEN: string = ""
// ---------------------- MONGO URI ----------------------
export const MONGO: string = ""
// ---------------------- EMAIL ----------------------
export const EMAIL: string = "farmania@inbox.ru";
// ---------------------- END ----------------------

// ---------------------- DEVELOPER ----------------------
export const DEVELOPER_ID: UserResolvable = "382906068319076372";

// ---------------------- SETTINGS ----------------------
export const COST_TO_ADD_FOR_EACH_LEVEL: number = 600; // Space 1 level cost
export const SPACE_FOR_ONE_LEVEL: number = 50; // adding space per level
export const MAIN_COLLECTOR_TIME: number = 35 * 1000; // menu collector time

export const BUY_ANIMALS_X: number[] = [1] // how many animals can be bought at once

export const TIME_TO_CHANGE_PARAMETER: number = 30 * 1000; // server settings changing collector's time

export const DELETE_TIMEOUT_MESSAGES: number = 5000; // deletes answers (messages) after replying (menu)

export const OneDay: number = 86400000; // One day in milliseconds

export const TicTacToeCooldown: number = 1000 * 60 * 20; // Cooldown after playing ttt with real member

export const ERROR_EMOJI: EmojiResolvable = "<:cancel1:926005208176271422>"; // error emoji
export const SUCCESS_EMOJI: EmojiResolvable = "<:checked:926005208335663124>"; // success emoji
export const PAGINATION_EMOJIS: EmojiResolvable[] = ["⏮", "⏪", "⏩", "⏭"]; // pagination emojis

export const PREFIX: string = "!"; // default prefix
export const colors: {[k: string]: ColorResolvable} = { // colors
    main: "WHITE",
    error: "#FF5440",
    success: "#7A912A",
    none: "#2f3136",
}

export const SLOTS_DEFAULT_JACKPOT: number = 200;

export const MathGameCollectorTime: number = 5000;

export const DailyGiftsAdding = { // daily gifts default
    coins: 1500,
    mega: 10,
    megaAfterDays: 5,
    chips: 5
}

export const Rewards = { // rewards from games
    ttt: {
        type: "coins" as CurrencyType,
        amount: 2500,
        amountAgainsMember: 2500 * 4
    },
    mathGame: {
        type: "coins" as CurrencyType,
        amount: 1000
    }
}

export const SlotsBets: number[] = [1, 5, 20, 50]
export const ONE_CHIP_IN_DOLLARS: number = 5;

// ---------------------- CREDITS ----------------------
export const DONATE_URLS = {
    ru: "https://www.donationalerts.com/r/aeol"
}; 
export const COINS_TO_DOLLARS: {amount: number, cost: number}[] = [ // buy coins with dollars
    {
        amount: 50_000,
        cost: 10
    },
    {
        amount: 300_000,
        cost: 50
    },
    {
        amount: 1_000_000,
        cost: 175
    }
].reverse();

export const CREDITS: {amount: number, onDollars: number}[] = [ // buy dollars with real money
    {
        amount: 30,
        onDollars: 1
    },
    {
        amount: 100,
        onDollars: 3
    },
    {
        amount: 500,
        onDollars: 10
    }
].reverse();

export const CLIENT_USER_AVATAR_URI: string = "https://cdn.discordapp.com/attachments/957192630700224522/957270591868633139/avatar.jpg";
