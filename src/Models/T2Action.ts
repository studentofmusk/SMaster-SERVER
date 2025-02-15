import mongoose, {Schema, Document, Types} from "mongoose";
export interface IT2Action extends Document{
    title: string;
    video: Types.ObjectId;
}

const t2ActionSchema = new Schema<IT2Action>({
    title:{
        type: String,
        required: true,
        unique: true
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required: [true, "Video ID must!"],
    }
}, {timestamps: true})


const T2Action = mongoose.model<IT2Action>("T2Action", t2ActionSchema);
export default T2Action;
