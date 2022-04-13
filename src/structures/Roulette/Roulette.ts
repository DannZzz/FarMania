import { Util } from "client-discord";
import { ChannelResolvable } from "discord.js";
import Chest from "../Chest";

export type RouletteBet = "red" | "black" | "odd" | "even" | number | [1, 12] | [13, 24] | [25, 36]
export type Player = {id: string, bet: number, betType: RouletteBet};

export const RouletteListener = new Chest<ChannelResolvable, Player[]>()

export class Roulette {
    private game: this = undefined;

    
    constructor (
        private channelId: ChannelResolvable
    ) {
    }

    addUser(player: Player) {
        RouletteListener.set(this.channelId, [...this.getChannel(), player])
    }

    clear() {
        const b = this.getChannel();
        RouletteListener.set(this.channelId, []);
    }

    get players () {
       return this.getChannel();
    }

    checkStart () {
        if (this.players.length > 0) {
            return true;
        } else return false;
    }

    /**
     * Filter winners by betType
     * 
     * @param {RouletteBet} betType Bet type
     * @returns {Player[]} Array of users
     */
    filter(betType: RouletteBet): Player[] {
        return this.players.filter(player => player.betType === betType)
    }
    
    private getChannel (channelId: ChannelResolvable = this.channelId, players: Player[] = []) {
        return RouletteListener.getOrCreate(channelId, players);
    }

    static betTypeToString (type: RouletteBet): string {
        if (!type && type !== 0) return "";
        if (!isNaN(+type)) return "" + type;
        if (type === "black") return "⚫";
        if (type === "red") return "🔴";
        if (type === "even") return "Чётное";
        if (type === "odd") return "Нечётное";
        if (Array.isArray(type)) return `${type[0]}-${type[1]}`;
    }

    static randomWin(): {num: number, color: "red" | "black", range: [1, 12] | [13, 24] | [25, 36], type: "odd" | "even" } {
        const num = Util.random(0, 36);
        if (num === 0) {
            return {
                num,
                range: undefined,
                color: undefined,
                type: undefined
            }
        }
        var color: "red" | "black" = "black", type: "odd" | "even" = "odd"

        if (num % 2 === 0) {
            color = "red";
            type = "even"
        }

        return {
            num, color, type,
            range: (() => {
                if (num <= 12) return [1, 12];
                if (num <= 24) return [13, 24];
                return [25, 36]
            })()
        }
    }
    
}

function inRange (num: number): boolean {
    if (num >= 0 && num <= 36) return true;
    return false;
}