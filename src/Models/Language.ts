import mongoose, {Schema, Types, Document} from "mongoose";

export interface ILanguage extends Document{
    title: string;
    seasons: Types.ObjectId[];
    add_season: (season_id: Types.ObjectId)=>any
}

const languageSchema = new Schema<ILanguage>({
    title:{
        type: String,
        required: [true, "Title is required!"],
        trim: true,
        unique: true
    },
    seasons:{
        type: [Schema.Types.ObjectId],
        ref: "Season",
        default: []
    }
},{timestamps: true});

languageSchema.methods.add_season = function (season_id: Types.ObjectId) {
    if (!this.seasons.some((id: Types.ObjectId) => id.equals(season_id))) {
        this.seasons.push(season_id);
    }
};
const Language = mongoose.model<ILanguage>("Language", languageSchema);
export default Language;