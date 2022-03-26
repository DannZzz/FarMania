import { CurrencyType } from "./Main";

/**
 * Get item's real cost
 * 
 * @param type currency type
 * @param amount amount (number)
 * @param count the count of items *
 */
export function getRealCost (type: CurrencyType, amount: number): number;
export function getRealCost (type: CurrencyType, amount: number, count: number): number;
export function getRealCost (type: CurrencyType, amount: number, count?: number): number {
    var cost = amount;
    if (type !== "coins") {
        cost = cost / 4 * 1000;
    } else {
        cost = cost / 4 * 3;
    };
    return Math.round(cost * (typeof count === "undefined" ? 1 : count) );
}