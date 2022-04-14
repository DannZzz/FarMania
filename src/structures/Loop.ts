export class Loop {
    private _count: number = 0;
    /**
     * Create a loop similar to setInterval global function
     */
    constructor();
    /**
     * Create a loop similar to setInterval global function
     * 
     * @param {number} interval interval time ms
     */
    constructor (interval: number);
     /**
     * Create a loop similar to setInterval global function
     * 
     * @param {number} interval interval time ms
     * @param {Function} fn callback function
     */
    constructor (interval: number, fn: () => any);
     /**
     * Create a loop similar to setInterval global function
     * 
     * @param {number} interval interval time ms
     * @param {Function} fn callback function
     */
    constructor (public interval?: number, public fn?: () => any) {
    }

    /**
     * Set Function
     * 
     * @param {Function} fn function to do 
     */
    setFunction(fn: () => any) {
        this.fn = fn;
        return this;
    }

    /**
     * Set Interval
     * 
     * @param {number} interval intertval time ms
     */
    setInterval(interval: number) {
        this.interval = interval;
        return this;
    }

    /**
     * Count of done functions
     */
    get count () {
        return this._count;
    }

    start() {
        if (!this.interval && this.interval !== 0) throw new Error("Loop Error: Invalid interval");
        if (!this.fn || typeof this.fn !== "function") throw new Error("Loop Error: Invalid function");
        setInterval(() => this._count++, this.interval)
        setInterval(this.fn, this.interval);
    }
}
