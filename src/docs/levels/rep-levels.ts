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
    },
    {
        uniqueId: "5th",
        async action(userId) {
            await changeMoney("chips", userId, 30);
        },
        reputationNeed: 1500,
        interface: () => `${Currency.chips.emoji}\`${Util.formatNumber(30)}\``
    },
    {
        uniqueId: "6th",
        async action(userId) {
            await changeMoney("dollars", userId, 65);
        },
        reputationNeed: 5000,
        interface: () => `${Currency.dollars.emoji}\`${Util.formatNumber(65)}\``
    },
    {
        uniqueId: "7th",
        async action(userId) {
            await changeMoney("coins", userId, 1000000);
        },
        reputationNeed: 15500,
        interface: () => `${Currency.coins.emoji}\`${Util.formatNumber(1000000)}\``
    },
    {
        uniqueId: "8th",
        async action(userId) {
            await changeMoney("dollars", userId, 250);
        },
        reputationNeed: 47000,
        interface: () => `${Currency.dollars.emoji}\`${Util.formatNumber(250)}\``
    },

]