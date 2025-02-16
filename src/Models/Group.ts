import mongoose, {Schema, Types, Document} from "mongoose";

export interface IGroup extends Document{
    title: string;
    season_id:Types.ObjectId;
    lessons: Types.ObjectId[];
    add_lesson: (lesson_id: Types.ObjectId)=>any;
}

const groupSchema = new Schema<IGroup>({
    title:{
        type: String,
        required: [true, "Title is required!"],
        trim: true
    },
    season_id:{
        type:Schema.Types.ObjectId,
        required:[true, "Season ID is required!"]
    },
    lessons:{
        type: [Schema.Types.ObjectId],
        ref: "Lesson",
        default: []
    }
},{timestamps: true});

groupSchema.methods.add_lesson = function (lesson_id: Types.ObjectId){
    if(!this.lessons?.some((id: Types.ObjectId)=>id.equals(lesson_id))){
        this.lessons.push(lesson_id);
    }
}

const Group = mongoose.model<IGroup>("Group", groupSchema);
export default Group;