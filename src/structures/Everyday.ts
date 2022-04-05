/**
 * @example
 * new Date().toLocalTimeString().substring(0, 5) // "14:05"
 * new Date().toLocalTimeString().substring(0, 2) // "14"
 */
type TimeString = string;

/**
 * Run function one time per day
 * 
 * @usage
 * Use "start" method after building
 */
export class Everyday {
    private date: Date;
    private timeToCheck: TimeString;
    private interval: number = 1000 * 60 * 5;
    private timezone: { locales?: string, options?: Intl.DateTimeFormatOptions } = {}
    private _oneTimeInDay: () => Promise<any>;
    private _updateBase: (date: Date) => Promise<void>
    lastTime: Date = null;
    lastValue: any = null;

    constructor(options?: {
        date?: Date,
        timeToCheck?: TimeString,
        timezone?: { locales?: string, options?: Intl.DateTimeFormatOptions }
        /**
         * default: 5 minutes (300000 ms)
         */
        interval?: number,
        oneTimeInDay?: () => Promise<any>,
        updateBase?: (date: Date) => Promise<void>
    }) {
        if (options) {
            if(options.date) this.date = options.date;
            if (options.timeToCheck) {
                this.timeToCheck = options.timeToCheck
                this.checkTimeString();
            };
            if (options.interval || options.interval === 0) this.interval = options.interval;
            if (options.oneTimeInDay) this._oneTimeInDay = options.oneTimeInDay;
            if (options.updateBase) this._updateBase = options.updateBase;
            if (options.timezone) this.timezone = options.timezone;
        }
        
    }

    /**
     * Start system
     */
    start() {
        this.makeInterval();
        return this;
    }

    /**
     * Set timezone option
     * 
     * @param {string} locales 
     * @param {Intl.DateTimeFormatOptions} options 
     */
    setTimeZone (locales: string, options?: Intl.DateTimeFormatOptions) {
        this.timezone.locales = locales;
        if(options) this.timezone.options = options;
        return this;
    }

    /**
     * Set updateBase function option
     * 
     * @param func database updating function 
     */
    setUpdateBase(func: (date: Date) => Promise<void>) {
        this._updateBase = func;
        return this;
    }
    
    /**
     * Set oneTimeInDay function option
     * 
     * @param func function to run per day one time
     * @returns 
     */
    setOneTimeInDay(func: () => Promise<any>) {
        this._oneTimeInDay = func;
        return this
    }

    /**
     * Set timeToCheck option
     * 
     * @param {TimeString} time hh:mm
     * @example
     * new Date().toLocaleTimeString().substring(0, 5) // "11:05"
     */
    setCheckTime(time: TimeString) {
        this.timeToCheck = time;
        this.checkTimeString();
        return this;
    }

    /**
     * Set date option
     * 
     * @param {Date} date last time checked date object
     */
    setDate(date: Date = new Date()) {
        this.date = date;
        return this;
    }

    /**
     * Set interval option
     * 
     * @param {number} ms timeout in milliseconds between checks
     */
    setInterval(ms: number) {
        this.interval = ms;
        return this;
    }


    /**
     * Update base
     * 
     * @param {Date} date new date object to update
     */
    async updateBase(): Promise<void>;
    async updateBase(date: Date): Promise<void>;
    async updateBase(date: Date = new Date()): Promise<void> {
        this.lastTime = date;
        this.date = date;
        await this._updateBase(date);
    }

    /**
     * Run function now and update data
     */
    async doNow() {
        return await this._oneTimeInDay();
    }

    private makeInterval() {
        // checks
        this.checkDate()
        this.checkOneDayFunction()
        this.checkUpdateBase()
        this.checkTimeString()
        
        setInterval(async () => {
            this.lastValue = (await this.main()) || null;
        }, this.interval)
    }
    
    private async main() {
        if (!this.hasOneDayPassed()) return;
        await this.updateBase(new Date());
        return await this._oneTimeInDay();
    }

    private hasOneDayPassed(): boolean {
        const [l, o] = [this.timezone.locales, this.timezone.options]
        // base
        const date = this.date.toLocaleDateString(l, o);
        // now
        const date_now = new Date().toLocaleDateString(l, o);
        const time_now = new Date().toLocaleTimeString(l, o).substring(0, this.timeToCheck.length === 2 ? 2 : 5);

        if (date === date_now) return false;
        if (time_now !== this.timeToCheck) return false;
        
        return true;
    }

    private checkTimeString () {
        if (!this.timeToCheck || (this.timeToCheck.length !== 5 && this.timeToCheck.length !== 2)) throw new Error("timeToCheck options must be an time string, like: 09:50"); 
    }

    private checkDate () {
        if (!this.date) throw new Error("date option must exist")
    }

    private checkUpdateBase() {
        if (!this._updateBase) throw new Error("updateBase option must exist")
    }

    private checkOneDayFunction() {
        if (!this._updateBase) throw new Error("OneTimeinDay option must exist")
    }

}