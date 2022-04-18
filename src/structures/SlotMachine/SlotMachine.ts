import { SlotSymbol, SlotSymbols } from "./Symbols";
import { Util } from "client-discord";

export class SlotMachine {
    readonly symbols = SlotSymbols;
    board: SlotSymbol[][];
    constructor(readonly width: number = 5, readonly height: number = 3) {
        this.updateBoard();
        this.perfectBoard();
    }

    async getResult(bet: number, userId: string): Promise<{amount: number, custom?: number[]}> {
        // console.log("NEW RESULT")
        let sum = [];
        const b = this.board;
        var custom: number[] = [];
        let indexes: number[] = [];
        await Promise.all(b.map(async (row, i) => {
            if (row.every(symbol => symbol === row[0])) {
                
                indexes.push(i);
                if (row[0].customReward) {
                    custom.push(row[0]?.customInterface())
                    const r = row[0].customReward;
                    sum.push(r);
                    // console.log("sum after custom: " + sum)
                } else {
                    sum.push((bet * (row.length - row[0].minimum + 1)) * row[0].adding);
                }
            }
        }));

        async function getCustomValues (sum: (SlotSymbol["customReward"] | number)[]) {
            const numbers = sum.filter(b => typeof b === "number") as number[];
            const mapped = sum.filter(b => (typeof (b) !== "number")) as SlotSymbol["customReward"][];
            
            const uniqued = [... new Set(mapped)];
            const arr = await Promise.all(uniqued.map(async f => {
                return await f(mapped.filter(v => v === f).length, userId);
            }))
            
            const res = arr.reduce((g, v) => g + v, 0) + numbers.reduce((g, v) => g + v, 0);
            
            return res;
        }
        
        if (indexes.length === this.height) return {amount: Math.round(await getCustomValues(sum)), custom};
        
        // console.log(sum)
        const for3x = [];
        b.forEach((row, j) => {
            
            if (!indexes.includes(j)) {
                const _defaultSymbol = row[Math.floor(this.width / 2)];
        
                const df = _defaultSymbol;
                
                const length = row.filter(s => s === df).length
                if (length >= df.minimum) {
                    // 4x
                    for (let i = 0; i + 3 < this.width; i++) {
                        if (row[i] === row[i + 1] && row[i] === row[i + 2] && row[i] === row[i + 3]) {
                            sum.push((bet * 2) * row[i].adding)
                            for3x.push(j);
                            // console.log("4x Row:" + j + "\n" + sum + "\n ---------")
                            break;
                        }
                    }

                    // console.log(for3x)
                    
                    if (!for3x.includes(j)) {
                        // 3x
                        for (let i = 0; i + 2 < this.width; i++) {
                            // console.log("Checking 3x row [" + j + "]: " + i + " " + (i + 1) + " " + (i + 2));
                            if (row[i] === row[i + 1] && row[i] === row[i + 2]) {
                                sum.push(bet * row[i].adding)
                                // console.log("3x Row:" + j + "\n" + sum + "\n ---------")

                                break;
                            }
                        }
                    }

                }
            }
        });
        // console.log(sum)
        return {amount: Math.round(await getCustomValues(sum)), custom};
    }

    perfectBoard () {
        this.board.forEach(row => row.fill(this.symbols[this.symbols.length - 1]))
    }

    updateBoard() {
        var arr: SlotSymbol[][] = [];
        for (let i = 0; i < this.width * this.height; i += this.width) {
            let toAdd = [];
            for (let j = 0; j < this.width; j++) {
                toAdd.push(this.randomSymbol())
            }
            arr.push(toAdd)
        }
        this.board = arr;
    }

    get stringBoard(): string {
        var main: string[] = [];
        this.board.forEach(row => {
            var thisRow = []
            row.forEach(symbol => thisRow.push(symbol.emoji));
            main.push(thisRow.join("•"))
        })
        return main.join("\n")
    }

    private randomSymbol() {
        const randomNum = Util.random(1, 100);
        const valids = this.symbols.filter(s => randomNum <= s.chance).sort((a, b) => a.chance - b.chance);
        // console.log("numb " + randomNum + "\n" + valids)
        const a = valids.every(a => a.chance === valids[0].chance);
        
        const b = a ? valids[Math.floor(Math.random() * valids.length)] : valids[0];
        return b
    }

}