import { MONGO } from "../config";
import mongoose from "mongoose";

export default () => mongoose.connect(process.env.MONGO || MONGO);
