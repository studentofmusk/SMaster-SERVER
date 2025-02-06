import mongoose, { Schema } from "mongoose";
const v2TextSchema = new Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: [true, "Video ID must!"],
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: (value) => value.length === 4,
            message: "Options must contain exactly 4 items."
        }
    }
}, { timestamps: true });
const V2Text = mongoose.model("V2Text", v2TextSchema);
export default V2Text;
