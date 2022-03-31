import { Client } from "client-discord";
import { Message, PermissionResolvable, TextBasedChannel } from "discord.js";
import { ServerModel } from "../database/models/ServerModel";

export type MessageCommandRunOptions = {
    client: Client;
    args: string[];
    msg: Message;
    prefix: string;
    sd: ServerModel;
    methods: any;
}

export class MessageCommand {
    readonly name: string;
    readonly aliases?: string[];
    readonly private?: true;
    readonly description: string;
    readonly disabled?: boolean;
    readonly permissions?: PermissionResolvable;
    readonly cooldown?: number;
    readonly developer?: boolean;
    readonly hideInHelp?: boolean;

    constructor(options: Pick<MessageCommand, Exclude<keyof MessageCommand, "execute">>) {
        this.name = options.name;
        this.aliases = options.aliases || [];
        this.description = options.description;
        this.disabled = Boolean(options.disabled);
        this.cooldown = options.cooldown || 0;
        this.developer = Boolean(options.developer);
        this.hideInHelp = Boolean(options.hideInHelp);
        this.permissions = options.permissions || [];
    }

    protected getCommand(): MessageCommand {
        return this;
    }

    async execute({ client, msg, args, prefix, methods, sd }: MessageCommandRunOptions): Promise<any> {
        return console.log(`❌ Command with ${this.name} hasn't execute function!`);
    }
}