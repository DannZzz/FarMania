type Card = {number: number, interface: string};
export type FullCard = { type: string; card: Card };

class Cards {
    protected readonly _types: ReadonlyArray<string> = ["♥", "♦", "♠", "♣"]
    
    protected readonly _cards: ReadonlyArray<Card> = [
        {
            number: 2,
            interface: "2"
        },
        {
            number: 3,
            interface: "3"
        },
        {
            number: 4,
            interface: "4"
        },
        {
            number: 5,
            interface: "5"
        },
        {
            number: 6,
            interface: "6"
        },
        {
            number: 7,
            interface: "7"
        },
        {
            number: 8,
            interface: "8"
        },
        {
            number: 9,
            interface: "9"
        },
        {
            number: 10,
            interface: "10"
        },
        {
            number: 11,
            interface: "J"
        },
        {
            number: 12,
            interface: "Q"
        },
        {
            number: 13,
            interface: "K"
        },
        {
            number: 14,
            interface: "T"
        }
    ]

    protected _randomCard(): FullCard {
        return {
            type: this._types[Math.floor(this._types.length * Math.random())],
            card: this._cards[Math.floor(this._cards.length * Math.random())]
        }
    }

    protected toString(full: FullCard): string {
       return `${full.type} **${full.card.interface}**`;
    }
}

export class CardGame extends Cards {
    readonly cards: Array<FullCard> = []
    private _card: FullCard = null;
    constructor() {
        super()
        this._card = this.randomCard();
    }

    get card () {
        return this._card;
    }

    toString(full: FullCard): string {
        return super.toString(full)
    }
    randomCard(): FullCard {
        var card = super._randomCard();
        while (this.cards.includes(card)) {
            card = super._randomCard()
        }
        this.cards.push(card);
        return card;
    }
}

const a = new CardGame()