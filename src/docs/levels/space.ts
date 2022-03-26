import { COST_TO_ADD_FOR_EACH_LEVEL, SPACE_FOR_ONE_LEVEL } from "../../config";
import { AnimalData } from "../../database/models/GameModel";
import { AnimalNames } from "../animals/Animal";
import { Animals } from "../animals/Animals_list";

/**
 * Get the cost amount for the next level
 * 
 * @param spaceLevel Space level of the user
 * @returns Object {dollars, coins}
 */
export function costForSpaceNextLevel (spaceLevel: number): {dollars: number, coins: number} {
    const add = Math.round(COST_TO_ADD_FOR_EACH_LEVEL);
    const l = Math.round(spaceLevel) + 1;
    return {
        dollars: Math.round(l * (add / 1000)),
        coins: Math.round(l * add)
    }
}

/**
 * Calculate the real values for a storage
 * 
 * @param spaceLevel user's space level
 * @param animals user's animals array
 * @returns  Object {space, validSpace}
 */
export function calculateSpace(spaceLevel: number, animals: AnimalData[]) {
    let all = Math.round(animals.reduce((aggr, data) => {
        if (data.count > 0) return aggr + ((Animals[data.name]?.spaceTake || 1) * data.count)}, 0));
    const spaceNumber = Math.round(spaceLevel * SPACE_FOR_ONE_LEVEL);
    return {
        space: all,
        validSpace: spaceNumber
    }
}