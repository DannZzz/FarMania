import { Client, Util } from "client-discord";
import { Guild, Message, User } from "discord.js";
import { DELETE_TIMEOUT_MESSAGES, ERROR_EMOJI, SUCCESS_EMOJI } from "../config";
import { findOrCreateOne, models } from "../database/db";
import { ServerModel } from "../database/models/ServerModel";
import { TextExp } from "../docs/languages/createText";
import { ReputaionLevelData } from "../docs/levels/rep-levels";
import { Embed } from "./Embed";
import { Functions } from "./Functions";

export class ReputationLevel {
    private user: User;
    private data = ReputaionLevelData as ReputaionLevelData[]
    constructor(
        private client: Client,
        private msg: Message,
        private sd: ServerModel,
        user?: User
    ) {
        this.user = user || msg.author;
        this.checkDuplicates()
        this.sortData()
    }

    async makeText(): Promise<string> {
        const data = await findOrCreateOne("games", {findOption: this.user.id});
        const rep = Functions.calculateReputation(data.animals)
        const rew = data.repRewards || [];
        const texted: string[] = [];

        for (let i of this.data) {
            texted.push(
                `(${i.reputationNeed <= rep ? SUCCESS_EMOJI : ERROR_EMOJI}) ✨\`${Util.formatNumber(i.reputationNeed)}\` — ${i.interface()} ${rew.includes(i.uniqueId) ? TextExp(90, this.sd.language) : (i.reputationNeed <= rep ? TextExp(91, this.sd.language) : "")}`
            )
        }

        return texted.join("\n");
    }

    async collectAll() {
        const data = await findOrCreateOne("games", {findOption: this.user.id});
        const rew = data.repRewards || [];
        const rep = Functions.calculateReputation(data.animals)

        for (let i of this.data) {
            if (i.reputationNeed <= rep && !rew.includes(i.uniqueId)) {
                await i.action(this.user.id).then(async v => {
                    if (v !== false) await models.games.updateOne({_id: this.user.id}, {$push: {repRewards: i.uniqueId}});
                })
                Embed(this.msg).setSuccess(`${TextExp(73, this.sd.language)}: ${i.interface()}`).setTitle(`🎉 | ${TextExp(89, this.sd.language)}`).send(DELETE_TIMEOUT_MESSAGES);
            }
        }
        
    }

    async checkCollecting () {
        const data = await findOrCreateOne("games", {findOption: this.user.id});
        const rew = data.repRewards || [];
        const rep = Functions.calculateReputation(data.animals)

        return this.data.some(i => i.reputationNeed <= rep && !rew.includes(i.uniqueId));
    }

    private sortData () {
        this.data = this.data.sort((a, b) => a.reputationNeed - b.reputationNeed)
    }

    private checkDuplicates () {
        const ids = this.data.map(i => i.uniqueId);
        if (ids.length !== [...new Set(ids)].length) throw new Error("Reputation level ids doesn't includes duplicates")
    }
}