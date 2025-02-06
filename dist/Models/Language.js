import mongoose, { Schema } from "mongoose";
const languageSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required!"],
        trim: true
    },
    seasons: {
        type: [Schema.Types.ObjectId],
        ref: "Season",
        default: []
    }
}, { timestamps: true });
const Language = mongoose.model("Language", languageSchema);
export default Language;
