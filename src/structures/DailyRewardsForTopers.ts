import { Client } from "client-discord";
import { OneDay, REPUTATION_REWARDS } from "../config";
import { changeMoney, findOrCreateOne, models } from "../database/db";
import { Everyday } from "./Everyday";
import { Functions } from "./Functions";

export class ReputationRewards {
    constructor(private client?: Client) {

    }

    async reputation() {
        const bot = await findOrCreateOne("bot", {findOption: "main"});
        
        return new Everyday()
            .setCheckTime("00")
            .setDate(bot.reputationRewardsDate || new Date(
                Date.now()-OneDay
            ))
            .setOneTimeInDay(async () => {
                const datas = await models.games.find().exec();
                const sorted = datas.sort((a, b) => Functions.calculateReputation(b.animals || []) - Functions.calculateReputation(a.animals || []));

                const x3 = sorted.slice(0, 3)
                
                await Promise.all([
                    changeMoney("dollars", x3[0]._id, REPUTATION_REWARDS[0]),
                    changeMoney("dollars", x3[1]._id, REPUTATION_REWARDS[1]),
                    changeMoney("dollars", x3[2]._id, REPUTATION_REWARDS[2]),
                ])
            })
            .setTimeZone("ru-RU", {timeZone: "Europe/Moscow"})
            .setUpdateBase(async (date) => {
                await models.bot.updateOne({_id: "main"}, {$set: {reputationRewardsDate: date}})
            })
            .start()
    }
}

export function runReputationRewards() {
    new ReputationRewards().reputation()
}