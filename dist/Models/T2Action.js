import mongoose, { Schema } from "mongoose";
const t2ActionSchema = new Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: [true, "Video ID must!"],
    }
}, { timestamps: true });
const T2Action = mongoose.model("T2Action", t2ActionSchema);
export default T2Action;
