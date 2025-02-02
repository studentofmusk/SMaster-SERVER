import mongoose, {Schema, Types, Document} from "mongoose";

export interface IGroup extends Document{
    title: string;
    lessons: Types.ObjectId[];
}

const groupSchema = new Schema<IGroup>({
    title:{
        type: String,
        required: [true, "Title is required!"],
        trim: true
    },
    lessons:{
        type: [Schema.Types.ObjectId],
        ref: "Lesson",
        default: []
    }
},{timestamps: true});

const Group = mongoose.model<IGroup>("Group", groupSchema);
export default Group;