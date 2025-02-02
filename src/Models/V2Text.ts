import mongoose, {Schema, Document, Types} from "mongoose";
export interface IV2Text extends Document{
    video: Types.ObjectId;
    options: string[];
}

const v2TextSchema = new Schema<IV2Text>({
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required: [true, "Video ID must!"],
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
