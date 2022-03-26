import { SlotSymbol, SlotSymbols } from "./Symbols";

export class SlotMachine {
    readonly symbols = SlotSymbols;
    board: SlotSymbol[][];
    constructor(readonly size: number = 5) {
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
                    custom.push(row[0].customInterface())
                    const r = await row[0].customReward(bet, userId);
                    sum.push(r);
                    // console.log("sum after custom: " + sum)
                } else {
                    sum.push((bet * (row.length - row[0].minimum + 1)) * row[0].adding);
                }
            }
        }));

        if (indexes.length === this.size) return {amount: Math.round(sum.map(Number).reduce((g, v) => g + v, 0)), custom};
        
        // console.log(sum)
        const for3x = [];
        b.forEach((row, j) => {
            
            if (!indexes.includes(j)) {
                const _defaultSymbol = row[Math.floor(this.size / 2)];
        
                const df = _defaultSymbol;
                
                const length = row.filter(s => s === df).length
                if (length >= df.minimum) {
                    // 4x
                    for (let i = 0; i + 3 < this.size; i++) {
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
                        for (let i = 0; i + 2 < this.size; i++) {
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
        return {amount: Math.round(sum.map(Number).reduce((g, v) => g + v, 0)), custom};
    }

    perfectBoard () { 
        this.board[0].fill(this.symbols[0]);
        this.board[1].fill(this.symbols[1]);
        this.board[2].fill(this.symbols[4]);
        this.board[3].fill(this.symbols[2]);
        this.board[4].fill(this.symbols[3]);
        // this.board[0].fill(this.symbols[0]);
        // this.board[1].fill(this.symbols[1]);
        // this.board[2].fill(this.symbols[0]);
        // this.board[3].fill(this.symbols[1]);
        // this.board[4].fill(this.symbols[0]);
    }

    updateBoard() {
        var arr: SlotSymbol[][] = [];
        for (let i = 0; i < this.size * this.size; i += this.size) {
            let toAdd = [];
            for (let j = 0; j < this.size; j++) {
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
        return this.symbols[Math.floor(Math.random() * this.symbols.length)]
    }

}