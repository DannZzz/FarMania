import { Util } from "client-discord";
import { Cards, FullCard } from "./CardGame";
import Chest from "./Chest";
const BlackJackListener = new Set<string>();

export class BlackJack extends Cards {
    private _player = new Chest<string, FullCard>();
    private _bot = new Chest<string, FullCard>();
    private _step: "_player" | "_bot" = "_bot";

    constructor(private userId: string, private bet: number) {
        super();
        BlackJackListener.add(userId);
        
    }
    
    /**
     * Get Winner
     * 
     * @returns true if winner is user, false if bot, undefined if tie
     */
    winner(): undefined | true | false {
        const p = this.sum("_player");
        const b = this.sum("_bot");
        if (p > b) return true;
        if (b > p) return false;
        return;
    }

    /**
     * End the game
     */
    stop () {
        BlackJackListener.delete(this.userId)
    }

    /**
     * Add new card to the chest
     */
    addCard() {
        var card = this._randomCard();
        while (this.allCards.includes(card) || (this[this.step].size === 1 && card.card.interface === "T")) card = this._randomCard();
        if (card.card.interface === "T") {
            if (this.sum() > 10) {
                card.card.number = 1
            } else {
                card.card.number = 11
            };
        } else if (["J", "K", "Q"].includes(card.card.interface)) card.card.number = 10;
        this[this._step].set(`${card.type} **${card.card.interface}**`, card);
    }

    /**
     * Convers users's cards to strings
     * 
     * @returns {Object} {bot: string, player: string}
     */
    cardsToString(): {bot: string, player: string} {
        return {
            player: this.player.map(c => this.toString(c)).join("\n"),
            bot: this.bot.map(c => this.toString(c)).join("\n") || "** **",
        }
    }

    /**
     * Random Chance
     * 
     * @param {number} percentage a number between 1 and 100
     * @returns {boolean} true or false
     */
    static randomChance(percentage: number = 50): boolean {
        return Util.random(1, 100) >= percentage
    }

    /**
     * All used cards 
     */
    private get allCards (): Array<FullCard> {
        return [...this.player.values(), ...this.bot.values()];
    }
    
    /**
     * Calculate game reward
     * 
     * @returns Reward 
     */
    calculateReward() {
        const sum = this.sum();
        if (sum === 21) return this.bet * 2.5;
        return this.bet * 2;
    }

    /**
     * @returns true if win, false if lose, undefined if nothing
     */
    checkWin(): undefined | true | false {
        const p = this[this._step];
        const sum = this.sum();
        if (p.size === 2 && p.some(f => ["J", "K", "Q"].includes(f.card.interface)) && p.some(f => f.card.interface === "T")) return true;
        if (sum > 21) return false;
        return;
    }

    /**
     * 
     * @param {"_player" | "_bot"} player bot or player
     * @returns {number} sum of cards
     */
    sum(player: typeof this._step = this._step): number {
        const p = this[player];
        return p.map(a => a.card.number).reduce((a, b) => a + b, 0);
    }
    
    /**
     * Swith step
     */
    switch(): void {
        if (this._step === "_bot") {
            this._step = "_player";
        } else {
            this._step = "_bot";
        }
    }
    
    /**
     * Game Listener
     */
    static get listener() {
        return BlackJackListener;
    }

    /**
     * Player's cards
     */
    get player () {
        return this._player;
    }

    /**
     * Bot's cards
     */
    get bot () {
        return this._bot;
    }

    /**
     * Get step
     */
    get step () {
        return this._step;
    }
    
    /**
     * Check if user exists in base
     * 
     * @param {string} userId User id
     * @returns true if user already has a started game
     */
    static hasUser(userId: string) {
        return BlackJackListener.has(userId);
    }
}
