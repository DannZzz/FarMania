import { All_Languages, importFile } from "../..";
import { findOrCreateOne } from "../../database/db";
import { Languages } from "./language_list";

const defaultLanguage = All_Languages.get("Russian");

/**
 * Get right string (languages)
 * 
 * @param index index of text from docs
 * @returns string
 */
async function Text(index: number): Promise<string>;
/**
 * Get right string (languages)
 * 
 * @param index index of text from docs
 * @param guildId serverId
 * @returns string
 */
async function Text(index: number, guildId: string): Promise<string>;
/**
 * Get right string (languages)
 * 
 * @param index index of text from docs
 * @param guildId serverId
 * @returns string
 */
async function Text(index: number, guildId?: string): Promise<string> {
    if (typeof guildId === "string") {
        const thisGuild = await findOrCreateOne("servers", {findOption: guildId});
        const thisLanguageEnum = All_Languages.get(thisGuild.language || "ru");
       
        return thisLanguageEnum.data[index] || "🤷‍♀️";
    } else {
        return defaultLanguage.data[index] || "🤷‍♀️"
    }
    
}

/**
 * Get right string (languages) not Promise
 * 
 * @param index index of text from docs
 * @param toLanguage language short
 */
export function TextExp(index: number, toLanguage: Languages): string {
    const thisLanguageEnum = All_Languages.get(toLanguage || "ru");
    return thisLanguageEnum.data[index] || "🤷‍♀️";
}

export default Text;