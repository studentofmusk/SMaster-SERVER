import mongoose, { Schema } from "mongoose";
const lectureSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: [true, "Video ID must!"],
        unique: true
    }
}, { timestamps: true });
const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;
