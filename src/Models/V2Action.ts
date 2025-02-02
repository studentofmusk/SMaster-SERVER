import mongoose, {Schema, Document, Types} from "mongoose";
export interface IV2Action extends Document{
    video: Types.ObjectId;
}

const v2ActionSchema = new Schema<IV2Action>({
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required: [true, "Video ID must!"],
    }
}, {timestamps: true})


const V2Action = mongoose.model<IV2Action>("V2Action", v2ActionSchema);
export default V2Action;
