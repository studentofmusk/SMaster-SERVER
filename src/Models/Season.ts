import mongoose, {Schema, Types, Document} from "mongoose";

export interface ISeason extends Document{
    title: string;
    groups: Types.ObjectId[];
}

const seasonSchema = new Schema<ISeason>({
    title:{
        type: String,
        required: [true, "Title is required!"],
        trim: true
    },
    groups:{
        type: [Schema.Types.ObjectId],
        ref: "Group",
        default: []
    }
},{timestamps: true});

const Season = mongoose.model<ISeason>("Season", seasonSchema);
export default Season;