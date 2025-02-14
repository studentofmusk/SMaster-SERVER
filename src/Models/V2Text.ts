import mongoose, {Schema, Document, Types} from "mongoose";
export interface IV2Text extends Document{
    title: string;
    video: Types.ObjectId;
    options: string[];
}

const v2TextSchema = new Schema<IV2Text>({
    title:{
        type:String,
        required: [true, "Title is required!"],
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required: [true, "Video ID is required!"],
    },
    options:{
        type: [String],
        required: true,
        validate:{
            validator:(value: string[]) => value.length === 4,
            message:"Options must contain exactly 4 items."
        }
    }
}, {timestamps: true})

const V2Text = mongoose.model<IV2Text>("V2Text", v2TextSchema);
export default V2Text;
