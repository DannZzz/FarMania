import { Util } from "client-discord";
import { ChannelResolvable } from "discord.js";
import { AIRPLANE_TIMEOUTS } from "../../config";
import Chest from "../Chest";
import { AirplaneGame } from "./Game";

export type AirplanePlayer = {
    id: string;
    bet: number
}

const AirplaneListener = new Chest<ChannelResolvable, {status: "flying" | "collecting" | "ended", users: AirplanePlayer[], timeout?: Date, thisNumber: number}>()

export class Airplane {
    game: {status: "flying" | "collecting" | "ended", users: AirplanePlayer[], timeout?: Date, thisNumber: number}
    constructor (private channel: ChannelResolvable) {
        this.game = AirplaneListener.getOrCreate(this.channel, {status: "collecting", users: [], thisNumber: 1, timeout: new Date(Date.now() + this.nextTimeout)})
    }


    // randomNumber() {
    //     const mainNumber = Util.random(1, MAX_NUMBER_X_AIRPLANE);
    //     const sec = Util.random(0, 9);
    //     return mainNumber + (+`0.${sec}`);
    // }

    addUser(id: string, bet: number) {
        const g = this.game
        this.game.users.push({id, bet})
        AirplaneListener.set(this.channel, this.game);
    }

    addToNumber(add: number) {
        if (add !== 0 ) {
            this.game.thisNumber += add;
        } else {
            this.game.thisNumber = 1;
        }
        AirplaneListener.set(this.channel, this.game);
        
    }
    
    removeUser (id: string) {
        const users = this.game.users;
        const user = users.find(u => u.id === id);
        const newUsers = Util.remove(users, {elements: [user], indexes: []});
        this.game.users = newUsers
        AirplaneListener.set(this.channel, this.game);
    }

    newTimeout(ms: number) {
        this.game.timeout = new Date(Date.now() + ms)
        AirplaneListener.set(this.channel, this.game)
    }

    switchStatus (status1: "flying" | "collecting" | "ended") {
        // console.log("status: " + status1)
        // console.log(AirplaneListener)
        this.game.status = status1;
        AirplaneListener.set(this.channel, this.game)
        // console.log(AirplaneListener)
    }

    hasUser(id: string) {
        return Boolean(this.game.users.find(u => u.id === id))
    }

    get nextStatus(): "flying" | "collecting" | "ended" {
        const status = this?.game?.status || "collecting"
        if (status === "collecting") return "flying";
        if (status === "flying") return "ended";
        return "collecting"
    }

    get nextTimeout(): number {
        const status = this?.game?.status || "collecting"
        if (status === "collecting") return AIRPLANE_TIMEOUTS.collecting;
        if (status === "flying") return null;
        return AIRPLANE_TIMEOUTS.ended
    }


}