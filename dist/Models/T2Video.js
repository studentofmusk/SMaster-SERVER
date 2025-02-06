import mongoose, { Schema } from "mongoose";
const t2VideoSchema = new Schema({
    text: {
        type: String,
        required: [true, "Text is required!"],
    },
    options: {
        type: [Schema.Types.ObjectId],
        ref: "Video",
        required: [true, "Exactly 4 Video IDs are required!"],
        validate: {
            validator: (videos) => videos.length === 4 && videos.every((video) => mongoose.isValidObjectId(video)),
            message: "Options must contain exactly 4 valid Video ObjectIds.",
        },
    },
}, { timestamps: true });
const T2Video = mongoose.model("T2Video", t2VideoSchema);
export default T2Video;
