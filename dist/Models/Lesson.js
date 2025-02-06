import mongoose, { Schema } from "mongoose";
const lessonSchema = new Schema({
    total_xp: {
        type: Number,
        required: [true, "Total XP is required!"],
        min: [0, "Total XP must be non-negative."]
    },
    group_type: {
        type: Schema.Types.ObjectId,
        required: [true, "Group type is required!"]
    },
    topics: [
        {
            topic_type: {
                type: String,
                required: [true, "Topic type is required!"]
            },
            topic_id: {
                type: Schema.Types.ObjectId,
                required: [true, "Topic ID is required!"]
            },
            skippable: {
                type: Boolean,
                default: true
            },
            xp: {
                type: Number,
                required: [true, "XP value is required!"],
                min: [0, "XP must be non-negative."],
            },
        }
    ]
});
const Lesson = mongoose.model("Lesson", lessonSchema);
export default Lesson;
