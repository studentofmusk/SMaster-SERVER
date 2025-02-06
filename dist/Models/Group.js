import mongoose, { Schema } from "mongoose";
const groupSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required!"],
        trim: true
    },
    lessons: {
        type: [Schema.Types.ObjectId],
        ref: "Lesson",
        default: []
    }
}, { timestamps: true });
const Group = mongoose.model("Group", groupSchema);
export default Group;
