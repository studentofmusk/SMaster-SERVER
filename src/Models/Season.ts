import mongoose, {Schema, Types, Document} from "mongoose";

export interface ISeason extends Document{
    title: string;
    language_id: Types.ObjectId;
    groups: Types.ObjectId[];
    add_group: (group_id: Types.ObjectId)=>any
}

const seasonSchema = new Schema<ISeason>({
    title:{
        type: String,
        required: [true, "Title is required!"],
        trim: true
    },
    language_id:{
        type: Schema.Types.ObjectId,
        required:[true, "Language ID is required!"]
    },
    groups:{
        type: [Schema.Types.ObjectId],
        ref: "Group",
        default: []
    }
},{timestamps: true});



seasonSchema.index({title:1, language_id: 1}, {unique: true})
seasonSchema.methods.add_group = function (group_id: Types.ObjectId){
    if(!this.groups?.some((id: Types.ObjectId)=>id.equals(group_id))){
        this.groups.push(group_id)
    }
}

const Season = mongoose.model<ISeason>("Season", seasonSchema);
export default Season;