import mongoose, { Schema, Document, Types } from "mongoose";

export interface IT2Video extends Document {
    title: string;
    options: Types.ObjectId[];
}

const t2VideoSchema = new Schema<IT2Video>({
    title: {
        type: String,
        required: [true, "Text is required!"],
    },
    options: {
        type: [Schema.Types.ObjectId],
        ref: "Video",
        required: [true, "Exactly 4 Video IDs are required!"],
        validate: {
            validator: (videos: Types.ObjectId[]) =>
                videos.length === 4 && videos.every((video) => mongoose.isValidObjectId(video)),
            message: "Options must contain exactly 4 valid Video ObjectIds.",
        },
    },
}, {timestamps: true});

const T2Video = mongoose.model<IT2Video>("T2Video", t2VideoSchema);
export default T2Video;
