import { stripIndents } from "common-tags";
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
        UNLOCK_TRANSLATION_LEVEL : number
        SLOTS_JACKPOT_BOOST : number
        TRANSLATION_ADD_PER_LEVEL : number
        TRANSLATION_DEFAUT : number
        MAIN_COLLECTOR_TIME : number (seconds)
        COST_TO_ADD_FOR_EACH_LEVEL: number
        `).send()
    }
}