import mongoose, { Schema } from "mongoose";
const v2ActionSchema = new Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: [true, "Video ID must!"],
    }
}, { timestamps: true });
const V2Action = mongoose.model("V2Action", v2ActionSchema);
export default V2Action;
