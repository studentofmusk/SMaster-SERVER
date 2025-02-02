import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFollow extends Document{
    follower: Types.ObjectId;
    following: Types.ObjectId;
}

const followSchema = new Schema<IFollow>({
    follower:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    following:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

},{timestamps: true});


const Follow = mongoose.model<IFollow>("Follow", followSchema);
export default Follow;