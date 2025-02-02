import mongoose, { Document, Schema } from "mongoose";

export interface IVideo extends Document{
    title: string;
    url: string;
    thumbnail: string;
    audio: string;
    action_id: number;
}

const videoSchema = new Schema<IVideo>({
    title:{
        type: String,
        unique: true,
        required: [true, "Video Title is required!"] 
    },
    url:{
        type: String,
        required: [true, "Video url is required!"]
    },
    thumbnail:{
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

},{timestamps: true});

const Video = mongoose.model("Video", videoSchema);
export default Video;