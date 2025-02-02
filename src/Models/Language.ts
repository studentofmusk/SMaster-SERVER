import mongoose, {Schema, Types, Document} from "mongoose";

export interface ILanguage extends Document{
    title: string;
    seasons: Types.ObjectId[];
}

const languageSchema = new Schema<ILanguage>({
    title:{
        type: String,
        required: [true, "Title is required!"],
        trim: true
    },
    seasons:{
        type: [Schema.Types.ObjectId],
        ref: "Season",
        default: []
    }
},{timestamps: true});

const Language = mongoose.model<ILanguage>("Language", languageSchema);
export default Language;