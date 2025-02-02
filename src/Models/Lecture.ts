import mongoose, {Schema, Types, Document} from "mongoose";

export interface ILecture extends Document{
    video: Types.ObjectId;
}

const lectureSchema = new Schema<ILecture>({
    video:{
        type: Schema.Types.ObjectId,
        ref:"Video",
        required: [true, "Video ID must!"],
        unique: true
    }
}, {timestamps: true});

const Lecture = mongoose.model<ILecture>("Lecture", lectureSchema);
export default Lecture;