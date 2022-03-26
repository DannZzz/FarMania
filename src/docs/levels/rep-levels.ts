import { Util } from "client-discord";
import { MessageEmbed, Snowflake, TextBasedChannel, User } from "discord.js";
import { client } from "../..";
import { DELETE_TIMEOUT_MESSAGES } from "../../config";
import { changeMoney } from "../../database/db";
import { Embed, EmbedMessage } from "../../structures/Embed";
import { Currency } from "../currency/Main";
import { TextExp } from "../languages/createText";
import { Languages } from "../languages/language_list";

export type ReputaionLevelData = {
    uniqueId: string;
    /**
     * 
     * @param userId user id
     * @returns reward string
     */
    action(userId: string): Promise<any>
    reputationNeed: number;
    interface(): string;
}

export const ReputaionLevelData: ReadonlyArray<ReputaionLevelData> = [
    {
        uniqueId: "first",
        async action (userId) {
            await changeMoney("dollars", userId, 10);
        },
        reputationNeed: 100,
        interface: () => `${Currency.dollars.emoji}\`${Util.formatNumber(10)}\``
    },
    {
        uniqueId: "second",
        async action (userId) {
            await changeMoney("dollars", userId, 25);
        },
        reputationNeed: 150,
        interface: () => `${Currency.dollars.emoji}\`${Util.formatNumber(25)}\``
    },
    {
        uniqueId: "third",
        async action (userId) {
            await changeMoney("dollars", userId, 40);
        },
        reputationNeed: 300,
        interface: () => `${Currency.dollars.emoji}\`${Util.formatNumber(40)}\``
    },
    {
        uniqueId: "4th",
        async action(userId) {
            await changeMoney("chips", userId, 20);
        },
        reputationNeed: 500,
        interface: () => `${Currency.chips.emoji}\`${Util.formatNumber(20)}\``
    }
]