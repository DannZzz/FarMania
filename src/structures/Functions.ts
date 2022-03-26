import { AnimalData } from "../database/models/GameModel";
import { AnimalNames } from "../docs/animals/Animal";
import { Animals } from "../docs/animals/Animals_list";
import { TextExp } from "../docs/languages/createText";
import { Languages } from "../docs/languages/language_list";

export class Functions {
    static calculateReputation(array: AnimalData[]): number {
        var rep = 0;
        array.forEach(d => rep += (Animals[d.name].reputation || 0) * d.count);
        return rep;
    }
    
    static getTimeLang(lang: Languages): [string, string, string, string, string] {
        return [TextExp(38, lang), TextExp(39, lang), TextExp(40, lang), TextExp(41, lang), TextExp(42, lang)]
    }
}