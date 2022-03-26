import { Client } from "client-discord";
import * as Config from "./config";
import { Collection, EnumHolder } from "discord.js";
import { MessageCommand } from "./structures/MessageCommand";
import { Event } from "./structures/Event";
import { glob } from "glob";
import { promisify } from "util";
import ConnectMongo from "./database/connect";
import Chest from "./structures/Chest";
import { Languages } from "./docs/languages/language_list";
ConnectMongo();

export const All_Languages = new Chest<string, any>();

export const client: Client = new Client({token: (process.env.TOKEN || Config.TOKEN), colors: Config.colors, intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"]});

client.messageCommands = new Collection<keyof MessageCommand, MessageCommand>();
client.messageCommandsAliases = new Collection<string, string>();
const globPromise = promisify(glob);

(async function load () {
    await Promise.all([
        loadMessageCommands(),
        loadEvents(),
        loadLanguages()
    ])
})();


async function loadMessageCommands() {
    const commands = await globPromise(`${__dirname}/Mcommands/*/*{.ts,.js}`);
    
    for (let path of commands) {
        const Command: MessageCommand = new (await importFile(path));
        if (Command && !Command.disabled) {
            console.log(`Loaded command: ${Command.name} ✅`)
            client.messageCommands.set(Command.name, Command);
            if (Command?.aliases?.length > 0) Command.aliases.forEach(string => client.messageCommandsAliases.set(string, Command.name));
        }
    }
}

async function loadEvents() {
    const events = await globPromise(`${__dirname}/events/*{.ts,.js}`);
    for (let path of events) {
        const event: Event = new (await importFile(path));
        if (!event.disabled) client.on(event.name, (...args) => event.execute({client, values: args}));
    }
}

async function loadLanguages() {
    const langs = await globPromise(`${__dirname}/docs/languages/language_data/*{.ts,.js}`);
    
    for (let path of langs) {
        const file = await importFile(path);
        All_Languages.set(file.name, file)
    }
}

export async function importFile(path: string) {
    return (await import(path))?.default;
}


process.on("unhandledRejection", (error) => console.log(error));

client.on("error", () => {})


client.login()
