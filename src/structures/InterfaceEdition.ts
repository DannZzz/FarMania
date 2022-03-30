import { Client } from "client-discord";
import { ButtonStyle } from "discord-api-types";
import { EmojiResolvable, Message, MessageActionRow, MessageAttachment, MessageButton, MessageButtonStyle, MessageEmbed, MessageSelectMenu, MessageSelectMenuOptions, MessageSelectOptionData, SelectMenuInteraction, User } from "discord.js"
import { MAIN_COLLECTOR_TIME } from "../config";
import { ButtonEmojis } from "../docs/emojis/emoji";
import Text from "../docs/languages/createText";
export const Active = new Set();

// Typing
export interface Page<T> {
    embed(): Promise<MessageEmbed>;
    emoji?: EmojiResolvable;
    buttonLabel?: string;
    buttonType?: MessageButtonStyle;
    description?: string;
    buttons?(): Promise<Array<{ customFilter?(customId: string, userId: string): boolean, button: MessageButton, action(msg: Message, customId: string): Promise<any>, nextPage?: boolean, break?: boolean }>>;
    nextPage?: Page<T>;
    menus?(): Promise<Array<{ menu: MessageSelectMenu, action(value: string, msg: Message): Promise<any>, nextPage?: boolean, break?: boolean  }>>;
    customId?: string;
    customRows?(buttons: MessageButton[]): MessageActionRow[];
    type: "Group";
    attachments?(): Promise<Array<MessageAttachment>>
}

export interface CustomMenu { disabled?: boolean, maxValues?: number, customId: string, placeholder?: string, options: MessageSelectOptionData[] }

export interface PrimaryMenuData {
    send(): Promise<Message>,
    rows: MessageActionRow[],
    buttons: MessageButton[],
    mainEmbed: MessageEmbed,
    type: "Menu"
}



export class InterfaceEdition<T extends MessageEmbed> {
    private backPage: Array<Page<T> | PrimaryMenuData> = []
    private user: User;
    private message: Message;
    constructor(
        private readonly client: Client,
        private readonly pages: Array<Page<T>>,
        readonly backButton: MessageButton
    ) {
    }

    async createMenu(msg: Message): Promise<any> {
        this.message = msg;
        this.user = msg.author;
        if (Active.has(this.user.id)) return;
        Active.add(this.user.id)
        const primary = this.createPrimaryMenu(msg);
        const message = await primary.send();
        await this.final(message, primary)
    }

    async final(msg: Message, primary: PrimaryMenuData, thisPage?: Page<T>) {
        
        if (thisPage) {
           
            var buttons = [this.backButton, ...(thisPage?.buttons ? (await thisPage?.buttons?.()).map(d => d.button) : []), ... (thisPage?.menus ? (await (thisPage as Page<T>)?.menus?.()).map(b => b.menu) : [])];
            if (thisPage.nextPage) {
                const group = thisPage.nextPage;
                const b = new MessageButton()
                    .setCustomId(`${group.customId}`)
                    .setLabel(group.buttonLabel)
                    .setStyle(group.buttonType);

                if (group.emoji) b.setEmoji(group.emoji);
                buttons.push(b);
            }
            const collector = msg.createMessageComponentCollector({
                filter: async i => i.user.id === this.user.id && (buttons.map(b => b.customId).includes(i.customId) || (buttons.find(b => b.customId === i.customId) && thisPage?.buttons ? (await thisPage?.buttons?.()).map(d => d.button) : [].find(o => o.button.customId === i.customId)?.customFilter?.(i.customId, i.user.id) )),
                time: MAIN_COLLECTOR_TIME,
                max: 1
            });
            let clicked = false;
            collector.on('end', () => {
                if (!clicked) {
                    this.clearUser()
                    const rows = InterfaceEdition.createRows(buttons, true)
                    msg.edit({ components: rows });
                }
            });


            collector.on("collect", async b => {
                clicked = true;
                collector.stop();
                if(b.isSelectMenu()) {
                    const thisValue = b.values[0];
                    const thisMenu = (await thisPage.menus()).find(obj => obj.menu.customId === (b as SelectMenuInteraction).customId);
                    if (thisMenu.nextPage) {
                        const newPage = await thisMenu.action(thisValue, this.message) as Page<T>;
                        this.backPage.push(thisPage);
                        if (thisMenu.break && thisMenu.break === true) {
                            this.clearUser()
                            msg.delete();
                        } else {
                            await this.updateMessage(msg, newPage);
                            await this.final(msg, primary, newPage as Page<T>);
                        }
                    } else {
                        await thisMenu.action(thisValue, this.message);
                        if (thisMenu.break) {
                            this.clearUser()
                            msg.delete();
                        } else {
                            await this.updateMessage(msg, thisPage);
                            await this.final(msg, primary, thisPage);
                        }
                    }
                } else if (b.customId === this.backButton.customId) {
                    if (this.last.type === "Menu") {
                        await this.updateMessage(msg, this.last);
                        await this.final(msg, primary);
                    } else {
                        await this.updateMessage(msg, this.last);
                        await this.final(msg, primary, this.last)
                    }
                    this.backPage.pop()
                } else if (thisPage.nextPage && thisPage.nextPage.customId === b.customId) {
                    this.backPage.push(thisPage);
                    await this.updateMessage(msg, thisPage.nextPage);
                    await this.final(msg, primary, thisPage.nextPage);
                } else {
                    const buttonData = (await thisPage?.buttons()).find(bu => bu.button.customId === b.customId);
                    if (buttonData.button.style === "LINK") {
                        await this.final(msg, primary, thisPage);
                    } else if (buttonData.nextPage) {
                        const newPage = await buttonData.action(this.message, b.customId) as Page<T>;
                        this.backPage.push(thisPage);
                        if (buttonData.break && buttonData.break === true) {
                            this.clearUser()
                            msg.delete();
                        } else {
                            await this.updateMessage(msg, newPage);
                            await this.final(msg, primary, newPage as Page<T>);
                        }
                    } else {
                        await buttonData.action(this.message, b.customId);
                        if (buttonData.break && buttonData.break === true) {
                            this.clearUser()
                            msg.delete();
                        } else {
                            await this.updateMessage(msg, thisPage);
                            await this.final(msg, primary, thisPage);
                        }
                    }

                }
                
                await b.deferUpdate();
            })

        } else {
            const buttons = primary.buttons;
            const collector = msg.createMessageComponentCollector({
                filter: i => i.user.id === this.user.id && buttons.map(b => b.customId).includes(i.customId),
                time: MAIN_COLLECTOR_TIME
            });
            let clicked = false;
            collector.on("end", () => {
                if (!clicked) {
                    this.clearUser()
                    msg.edit({ components: InterfaceEdition.createRows(primary.buttons.map(b => b.setDisabled(true))) });
                }
            })

            collector.on('collect', async b => {
                await b.deferUpdate();
                clicked = true;
                const page = this.pages[+(b.customId.split("-")[1])];
                collector.stop();
                this.backPage.push(primary);
                await this.updateMessage(msg, page);
                await this.final(msg, primary, page);
            })
        }

    }


    private createPrimaryMenu(msg: Message): PrimaryMenuData {
        const user = msg.author;
        const mainEmbed = new MessageEmbed()
            .setColor(this.client.colors.main)
            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) });

        const texts = this.pages.map(group => {
            return `${group.emoji ? group.emoji + " " : ""}${group.description}`;
        });

        mainEmbed.setDescription(texts.length > 0 ? texts.join("\n\n") : "🤷‍♀️");

        const buttons = this.pages.map((group, index) => {
            const b = new MessageButton()
                .setCustomId(`PM-${index}`)
                .setLabel(group.buttonLabel)
                .setStyle(group.buttonType);

            if (group.emoji) b.setEmoji(group.emoji);
            return b;
        });

        const rows: MessageActionRow[] = [];
        for (let i = 0; i < buttons.length; i += 5) {
            rows.push(new MessageActionRow().addComponents(buttons.slice(i, i + 5).map(b => b.setDisabled(false))));

        };
        async function send(): Promise<Message> {
            return await msg.channel.send({ embeds: [mainEmbed], components: rows });
        }

        return {
            send,
            rows,
            type: "Menu",
            buttons,
            mainEmbed,
        }
    }

    private async updateMessage(msg: Message, options: Page<T> | PrimaryMenuData): Promise<Message> {
        msg.removeAttachments()

        if (options.type === "Group") {
            const buttons = [this.backButton.setDisabled(false), ... (!options.customRows && options?.buttons ? (await (options as Page<T>)?.buttons?.()).map(b => b.button) : []), ... (options?.menus ? (await (options as Page<T>)?.menus?.()).map(b => b.menu) : [])];
            if (options.nextPage) {
                const group = options.nextPage;
                const b = new MessageButton()
                    .setCustomId(`${group.customId}`)
                    .setLabel(group.buttonLabel)
                    .setStyle(group.buttonType);

                if (group.emoji) b.setEmoji(group.emoji);
                buttons.push(b);
            }
            var attachments = [];
            if (options.attachments ) attachments = await options.attachments();
            
            return await msg.edit({ files: attachments, components: !options.customRows ? (InterfaceEdition.createRows(buttons)) : options.customRows && (options?.buttons ? options.customRows((await (options as Page<T>)?.buttons?.()).map(b => b.button)) : []), embeds: [await (options as Page<T>).embed()] })
        } else {
            return await msg.edit({ components: (options as PrimaryMenuData).rows, embeds: [(options as PrimaryMenuData).mainEmbed], files: [] })
        }
    }

    /**
     * Components --> Rows
     * 
     * @param components buttons or select menus
     * @param disabled are ther disabled
     */
    static createRows(components: MessageButton[], disabled?: boolean): MessageActionRow[];
    static createRows(components: MessageSelectMenu[], disabled?: boolean): MessageActionRow[];
    static createRows(components: (MessageButton | MessageSelectMenu)[], disabled?: boolean): MessageActionRow[];
    static createRows(components: (MessageButton | MessageSelectMenu)[] | MessageSelectMenu[] | MessageButton[], disabled: boolean = false): MessageActionRow[] {
        if (disabled) components.forEach(b => b.setDisabled(true));
        
        let rows = []
        for (let i = 0; i < components.length; i += 5) {
            const sliced = components.slice(i, i + 5);
            const buttons = sliced.filter(c => c.type === "BUTTON");
            const menus = sliced.filter(c => c.type === "SELECT_MENU");
            if (buttons?.length > 0) rows.push(new MessageActionRow().addComponents(buttons))
            if (menus?.length > 0) rows.push(new MessageActionRow().addComponents(menus))
        }
        return rows;
    }

    /**
     * Create a simple menu
     * 
     * @param data basic data for menu
     * @returns object - {menu, row}
     */
    static createSelectMenu(data: CustomMenu) {
        const menu = new MessageSelectMenu()
            .addOptions(data.options.slice(0, 25))
            .setCustomId(data.customId)
            .setMaxValues(data.maxValues || 1)
            .setDisabled(Boolean(data.disabled))
            .setPlaceholder(data.placeholder || "—")
        const createMenu = new MessageActionRow().addComponents(
            menu
        );

        return {
            menu,
            row: createMenu
        }

    }

    /**
     * Create simple menus from options
     * 
     * @param {MessageSelectOptionData[]} options menu's options
     * @param limitInOne maximum count of options in one menu
     * @returns menus array
     */
    static makeSelectMenusFromOptions(options: MessageSelectOptionData[], limitInOne: number = 25, ) {
        const menus: MessageSelectMenu[] = [];
        for (let i = 0; i < options.length; i += limitInOne) {
            menus.push (
                new MessageSelectMenu()
                    .setCustomId("any"+i)
                    .setOptions(options.slice(i, limitInOne))
            )
        }
        return menus;
    }

    get last() {
        return this.backPage[this.backPage.length - 1];
    }

    private checkBack(data: Page<T> | PrimaryMenuData) {
        if (data?.type === "Menu") return false;
        return true;
    }

    private clearUser() {
        Active.delete(this.user.id);
    }
}