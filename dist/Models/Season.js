import mongoose, { Schema } from "mongoose";
const seasonSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required!"],
        trim: true
    },
    groups: {
        type: [Schema.Types.ObjectId],
        ref: "Group",
        default: []
    }
}, { timestamps: true });
const Season = mongoose.model("Season", seasonSchema);
export default Season;
