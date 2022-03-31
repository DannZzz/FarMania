import { Client, Presence } from "discord-rpc";

export class RPC {
    readonly client: Client

    /**
     * Create a RPC client
     * 
     * @param {Presence} options Presence data
     * @param {number} interval optional interval for changing presence
     */
    constructor(readonly options: Presence, readonly interval?: number) {
        this.client = new Client({ transport: 'ipc' })
    }

    private setActivity() {
        this.client.setActivity(this.options);
    }
    
    /**
     * 
     * @param id client id
     */
    login(id: string) {
        this.client.on("ready", () => {
            this.setActivity();
            if (this.interval) {
                setInterval(() => this.setActivity(), this.interval)
            }
        })
        this.client.login({clientId: id}).catch(console.error);
    }
}