import { Languages } from "../../docs/languages/language_list";
import mongoose from "mongoose";
import { PREFIX } from "../../config";

export interface ServerModel {
    _id: string;
    prefix: {type: String, default: typeof PREFIX } & typeof PREFIX;
    language: {type: String, default: Languages } & Languages
}

export const ServerModel = mongoose.model("servers", new mongoose.Schema<ServerModel>({
    _id: String,
    prefix: {type: String, default: PREFIX },
    language: {type: String, default: "ru"}
}))