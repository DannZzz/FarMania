import { Client } from "client-discord";
import { ClientEvents, Collection, ConstantsEvents, DataResolver, MessageApplicationCommandData } from "discord.js";

export type EventRunOptions<T> = {
    client: Client;
    values: T[]
}

export class Event{
    readonly name: keyof ClientEvents;
    readonly disabled?: boolean;
    constructor(options: Pick<Event, Exclude<keyof Event, "execute">>) {
        this.name = options.name;
        this.disabled = Boolean(options.disabled);
    }

    async execute({client, values}: EventRunOptions<DataResolver>): Promise<any> {
        return console.log(`Event with name ${this.name} hasn't execute function!`);
    }
}

