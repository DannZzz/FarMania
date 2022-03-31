import { Client } from "client-discord";
import { stripIndents } from "common-tags";
import { Guild, Message, MessageButton, MessageEmbed, User, PermissionResolvable, Formatters } from "discord.js";
import { All_Languages } from "..";
import { DELETE_TIMEOUT_MESSAGES, TIME_TO_CHANGE_PARAMETER } from "../config";
import { findOrCreateOne, models } from "../database/db";
import { ServerModel } from "../database/models/ServerModel";
import { TextExp } from "../docs/languages/createText";
import { Languages } from "../docs/languages/language_list";
import { MessageCollectorExp } from "./Collector";
import { DateTime } from "./DateAndTime";
import { Embed } from "./Embed";
import { Functions } from "./Functions";
import { Page } from "./InterfaceEdition";

export class ServerSettings {
    private user: User;
    private sd: ServerModel
    constructor(
        private readonly client: Client,
        private readonly msg: Message,
        private readonly guild: Guild,
        
    ) {
        this.user = msg.author;
    }

    async main (): Promise<Page<MessageEmbed>> {
        await this.getModel();
        const a = this;
        return {
            description: this.t(44) + ".",
            customId: "serverSettings",
            buttonLabel: this.t(44),
            buttonType: "PRIMARY",
            emoji: "⚙",
            type: "Group",
            async embed() {
                return Embed(a.msg).setTitle(`⚙ | ${a.t(44)}`).setText(a.t(45)) as MessageEmbed;
            },
            buttons: async () => [
                {
                    button: new MessageButton()
                        .setDisabled(a.canChange() ? false : true)
                        .setStyle(a.canChange() ? "SUCCESS" : "DANGER")
                        .setCustomId("changeLanguage")
                        .setLabel(a.t(52)),
                    nextPage: true,
                    async action (): Promise<Page<MessageEmbed>> {
                        return {
                            async embed() {
                                return Embed(a.msg).setTitle(a.t(52)).setText(a.t(47) + ` :flag_${(await a.getModel()).language}:`) as MessageEmbed;
                            },
                            buttonLabel: "anyLang",
                            customId: "sameLang",
                            buttonType: "SECONDARY",
                            type: "Group",
                            description: "anyy0",
                            buttons: async () => [
                                {
                                    button: new MessageButton()
                                            .setCustomId("changeLanguage")
                                            .setLabel(a.t(48))
                                            .setStyle("SECONDARY"),
                                    nextPage: true,
                                    async action(): Promise<Page<MessageEmbed>> {
                                       return {
                                           embed: async () => Embed(a.msg).setText(a.t(53)) as MessageEmbed,
                                           description: "any",
                                           customId: "same",
                                           buttonLabel: "lol",
                                           buttonType: "SECONDARY",
                                           type: "Group",
                                           buttons: async () => {
                                               return All_Languages.map((data, shortName) => {
                                                   return {
                                                        break: true,
                                                        button: new MessageButton()
                                                            .setCustomId("LANG-"+shortName)
                                                            .setStyle("SECONDARY")
                                                            .setEmoji(data.flag), // :flag_gb:
                                                        async action() {
                                                            await models.servers.updateOne({_id: a.guild.id}, {$set: {language: shortName}});
                                                            return Embed(a.msg).setSuccess(TextExp(51, shortName as Languages) + "\n" + TextExp(54, shortName as Languages)).setTitle(TextExp(7, shortName as Languages)).send(DELETE_TIMEOUT_MESSAGES + 5000);
                                                        }
                                                   }
                                               })
                                           }
                                           
                                       }
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    button: new MessageButton()
                        .setDisabled(a.canChange() ? false : true)
                        .setStyle(a.canChange() ? "SUCCESS" : "DANGER")
                        .setCustomId("changePrefix")
                        .setLabel(a.t(46)),
                    nextPage: true,
                    async action(): Promise<Page<MessageEmbed>> {
                        return {
                            async embed() {
                                return Embed(a.msg).setTitle(a.t(46)).setText(a.t(47) + " `" + (await a.getModel()).prefix + "`") as MessageEmbed;
                            },
                            buttonLabel: "any",
                            customId: "prefixx",
                            buttonType: "PRIMARY",
                            type: "Group",
                            description: "change prefix",
                            async buttons () {
                                return [
                                    {
                                        button: new MessageButton()
                                            .setCustomId("changePrefixButton")
                                            .setLabel(a.t(48))
                                            .setStyle("SECONDARY"),
                                        async action () {
                                            await Embed(a.msg).setText(a.t(49)+" "+`**${a.t(46)}**\n${a.t(4)} \`${DateTime.formatTime(DateTime.getTimeData(TIME_TO_CHANGE_PARAMETER, 0), false, Functions.getTimeLang(a.sd.language))}\``).send(DELETE_TIMEOUT_MESSAGES + 5000);
                                            const collector = new MessageCollectorExp(a.msg.channel, {filter: [a.user.id], time: TIME_TO_CHANGE_PARAMETER});
                                            let b = false;
                                            collector.on(undefined, async (msg) => {
                                                b = true
                                                collector.stop()
                                                await models.servers.updateOne({_id: a.guild.id}, {$set: {prefix: msg.content}});
                                                Embed(a.msg).setSuccess(a.t(51)).setTitle(a.t(7)).send(DELETE_TIMEOUT_MESSAGES);
                                            });
                                            collector.end(() => {
                                                if (!b) Embed(a.msg).setError(a.t(50)).setTitle(a.t(5)).send(DELETE_TIMEOUT_MESSAGES);
                                            })
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            ]
        }
    }

    canChange(permissions: PermissionResolvable = "MANAGE_GUILD") {
        return this.msg.member.permissions.has(permissions);
    }

    async getModel () {
        this.sd = await findOrCreateOne("servers", {findOption: this.guild.id});
        return this.sd;
    }

    t (index: number): string {
        return TextExp(index, this.sd.language);
    }
    
}