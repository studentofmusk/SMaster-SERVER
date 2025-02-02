import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface IFollow extends Document{
    follower: IUser["_id"];
    following: IUser["_id"];
}

const followSchema = new Schema<IFollow>({
    follower:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    following:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

},{timestamps: true});

const Follow = mongoose.model("Follow", followSchema);
export default Follow;