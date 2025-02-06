import mongoose, { Schema } from "mongoose";
const videoSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: [true, "Video Title is required!"]
    },
    url: {
        type: String,
        required: [true, "Video url is required!"]
    },
    thumbnail: {
        type: String,
        required: [true, "Thumbnail is required!"]
    },
    audio: {
        type: String,
        required: [true, "Audio is required!"]
    },
    action_id: {
        type: Number,
        required: [true, "Action ID required"],
        default: -1
    }
}, { timestamps: true });
const Video = mongoose.model("Video", videoSchema);
export default Video;
