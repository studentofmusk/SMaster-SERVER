import mongoose, { Document, Schema } from "mongoose";

export interface IVideo extends Document{
    title: string;
    url: string;
    thumbnail: string;
    audio: string;
    action_id: number;
}

const videoSchema = new Schema<IVideo>({
    

},{timestamps: true});

const Video = mongoose.model("Video", videoSchema);
export default Video;