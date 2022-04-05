import { stripIndents } from "common-tags";
import { UNLOCK_TRANSLATION_LEVEL, SLOTS_JACKPOT_BOOST, TRANSLATION_ADD_PER_LEVEL, MAIN_COLLECTOR_TIME, COST_TO_ADD_FOR_EACH_LEVEL, XP_ADD_AT_BUYING_ANIMALS, TRANSLATION_DEFAULT, REPUTATION_REWARDS } from "../../config";
import { Embed } from "../../structures/Embed";
import { MessageCommand, MessageCommandRunOptions } from "../../structures/MessageCommand";

export default class EnviromenVariables extends MessageCommand {
    constructor () {
        super({
            name: "env",
            description: "get env variable names",
            developer: true
        })
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        Embed(msg).setText(stripIndents`
        UNLOCK_TRANSLATION_LEVEL : \`${UNLOCK_TRANSLATION_LEVEL}\`
        SLOTS_JACKPOT_BOOST : \`${SLOTS_JACKPOT_BOOST}\`
        TRANSLATION_ADD_PER_LEVEL : \`${TRANSLATION_ADD_PER_LEVEL}\`
        TRANSLATION_DEFAULT : \`${TRANSLATION_DEFAULT}\`
        MAIN_COLLECTOR_TIME : \`${MAIN_COLLECTOR_TIME}\` (seconds)
        COST_TO_ADD_FOR_EACH_LEVEL: \`${COST_TO_ADD_FOR_EACH_LEVEL}\`
        XP_ADD_AT_BUYING_ANIMALS : \`${XP_ADD_AT_BUYING_ANIMALS}\`
        ${REPUTATION_REWARDS.map((value, i) => `REPUTATION_REWARDS_${i} : \`${value}\``).join("\n")}
        `).send()
    }
}