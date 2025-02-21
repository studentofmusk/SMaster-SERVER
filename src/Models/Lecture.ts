import mongoose, {Schema, Types, Document} from "mongoose";

export interface ILecture extends Document{
    title: string;
    video: Types.ObjectId;
}

const lectureSchema = new Schema<ILecture>({
    title:{
        type: String,
        unique: true,
        required: [true, "Video Title is required!"]
    },
    video:{
        type: Schema.Types.ObjectId,
        ref:"Video",
        required: [true, "Video ID must!"]
    }
}, {timestamps: true});

const Lecture = mongoose.model<ILecture>("Lecture", lectureSchema);
export default Lecture;