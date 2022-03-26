import { Util } from "client-discord";
import { changeMoney, findOrCreateOne, models } from "../database/db";
import { CodeModel } from "../database/models/CodeModel";
import { Currency, CurrencyType } from "../docs/currency/Main";

export type CodeTypes = CurrencyType;

export class RedeemCode {
    private validDate: Date = null;
    private maxCount: number = null
    private users: Array<string> = [];
    constructor (
        private _id: string,
        private rewardType: CodeModel["rewardType"],
        private reward: number,
        maxCount?: number,
        validDate?: Date
    ) {
        if (maxCount) this.maxCount = Math.round(maxCount);
        if (validDate) this.validDate = validDate;
    }

    async create(): Promise<boolean> {
        const check = await findOrCreateOne("redeemcodes", {findOption: this._id, denyCreation: true});
        if (check) return false;
        const data = new CodeModel(this);
        await data.save();
        return true;
    }

    static async use(userId: string, id: string): Promise<number | string> {
        const check = await findOrCreateOne("redeemcodes", {findOption: id, denyCreation: true});
        if (!check) return 105
        if (check.maxCount && check.maxCount <= check.users.length) return 106;
        if (check.validDate && check.validDate <= new Date()) return 107;
        if (check.users.includes(userId)) return 108;

        await Promise.all([
            models.redeemcodes.updateOne({_id: id}, {$push: {users: userId}}),
            changeMoney(check.rewardType, userId, check.reward)
        ])

        return `${Currency[check.rewardType].emoji}\`${Util.formatNumber(check.reward)}\``;
    }
    
}