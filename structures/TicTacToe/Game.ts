import { Client } from "client-discord";
import { MessageButton, Snowflake } from "discord.js";
import Chest from "../Chest";
const Listeners = new Chest<string, string[]>();

type playerData = Snowflake;

export class TicTacToe {
    board: string[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ]

    emojis = ["X", "O"];
   
    step: "First" | "Second";
    First: Snowflake;
    Second: Snowflake | "A.I" = "A.I";
    _winner: string = null;

    constructor(
        readonly players: playerData[],
        readonly chest = Listeners,
    ) {
        this.First = players[0];
        if (players[1]) this.Second = players[1];
        this.step = Math.random() < 0.5 ? "First" : "Second"
    }

    exists(type: "AI" | "USER") {
        const thisUser = this.chest.get(this.F);
        if (thisUser?.includes(type)) return true;
        return false;
    }

    updateData(type: "AI" | "USER", remove?: boolean) {
        const thisUser = this.chest.get(this.F);

        if (remove) {
            if (thisUser) {
                this.chest.set(this.F, thisUser.filter(t => t !== type))
            }
        } else if (thisUser) {
            this.chest.set(this.F, [...thisUser, type]);
        } else {
            this.chest.set(this.F, [type]);
        }
    }

    changeBlock(row: number, column: number) {
        this.board[row][column] = this.step;
        const isEnded = this.checkEnd();
        if (isEnded) {
            if (isEnded === "tie") {
                return isEnded;
            } else {
                if (isEnded === "A.I") {
                    this._winner = isEnded;
                } else {
                    this._winner = this[isEnded];
                }
                return isEnded;
            }
        };
        this.switchStep();
    }

    get winner () {
        return this._winner;
    }
    
    switchStep() {

        if (this.step === "First") {
            this.step = "Second";
        } else {
            this.step = "First";
        }
    }

    private getRandomEmptyBlock () {
        const arr = this.getEmptyBlocks();
        return arr[Math.floor(Math.random() * arr.length)]
    }

    getEmptyBlocks () {
        const lol: {row: number, column: number}[] = [];
        this.board.forEach((row, ir) => {
            row.forEach((column, ic) => {
                if (!column) lol.push({row: ir, column: ic});
            })
        });
        return lol;
    }

    aiStep() {
        const block = this.getRandomEmptyBlock();
        return this.changeBlock(block.row, block.column);
    }

    get F () {
        return this.First;
    }

    get S () {
        return this.Second
    }

    // [
    //     //     0    1    2
    //     // 0 ["x", "x", "x"]
    //     // 1 ["x", "x", "x"]
    //     // 2 ["x", "x", "x"]
    // ]

    checkEnd() {
        const b = this.board;
        
        const a = 
            (b[0][0] === b[0][1] && b[0][0] === b[0][2] && b[0][0])
            ||
            (b[1][0] === b[1][1] && b[1][0] === b[1][2] && b[1][0])
            ||
            (b[2][0] === b[2][1] && b[2][0] === b[2][2] && b[2][0])
            ||
            (b[0][0] === b[1][0] && b[0][0] === b[2][0] && b[0][0])
            ||
            (b[0][1] === b[1][1] && b[0][1] === b[2][1] && b[0][1])
            ||
            (b[0][2] === b[1][2] && b[0][2] === b[2][2] && b[0][2])
            ||
            (b[0][0] === b[1][1] && b[0][0] === b[2][2] && b[0][0])
            ||
            (b[2][0] === b[1][1] && b[2][0] === b[0][2] && b[2][0])
            ||
            (this.getEmptyBlocks().length === 0 && "tie");

        if (a) this.chest.delete(this.F);
        return a;
    }
    
    turnString() {
        const name1 = `<@${this.First}>`
        var name2 = "**A.I.**";
        if (this.Second !== "A.I") {
            name2 = `<@${this.Second}>`
        }

        const names = {
            "First": name1 + ` ❌`,
            "Second": name2 + ` ⭕`,
        }

        return `${name1} \`vs\` ${name2}\n\n--> ${names[this.step]}`
    }
    
    boardToButtons() {
        const labels: {name: string, id: string}[] = [];
        this.board.forEach((row, ir) => {
            row.forEach((column, ic) => {
                if (!column) {
                    return labels.push({id: `${ir}-${ic}`, name: "ㅤ"});
                } else if (column === "First") {
                    return labels.push({id: `${ir}-${ic}`, name: this.emojis[0]});
                } else {
                    return labels.push({id: `${ir}-${ic}`, name: this.emojis[1]});
                }
            })
        });

        return labels.map((label, i) => {
            if (this.emojis.includes(label.name)) {
                return new MessageButton()
                    .setCustomId(label.id)
                    .setLabel(label.name)
                    .setStyle(label.name === this.emojis[0] ? "PRIMARY" : "DANGER")
            } else {
                return new MessageButton()
                    .setCustomId(label.id)
                    .setLabel(label.name)
                    .setStyle("SECONDARY")
            }
        })
    }
    
}