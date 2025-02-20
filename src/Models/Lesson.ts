import mongoose, {Schema, Types, Document} from "mongoose";

export enum TopicTypes {
    LECTURE="LECTURE",
    V2TEXT="VIDEO_TO_TEXT",
    T2VIDEO="TEXT_TO_VIDEO",
    V2ACTION="VIDEO_TO_ACTION",
    T2ACTION="TEXT_TO_ACTION"
}

export enum LessonTypes {
    LEARNING="LEARNING",
    WARMUP="WARMUP",
    EXERCISE="EXERCISE",
    FINISH="FINISH"
}
export interface ILesson extends Document{
    total_xp: number
    topics: ITopic[];
    lesson_type: LessonTypes;
    group_id: Types.ObjectId;
    add_topic:(topic: ITopic)=>void;
};

export interface ITopic {
    topic_type: TopicTypes;
    topic_id: Types.ObjectId;
    skippable: boolean,
    xp: number
}

const lessonSchema = new Schema<ILesson>({
    total_xp:{
        type: Number,
        required: [true, "Total XP is required!"],
        min:[0, "Total XP must be non-negative."],
        default:0
    },
    group_id:{
        type: Schema.Types.ObjectId,
        required: [true, "Group type is required!"]
    },
    lesson_type:{
        type:String,
        enum:LessonTypes,
        required:true 
    },
    topics:{
        type:[
            {
                topic_type:{
                    type: String,
                    enum: TopicTypes,
                    required: [true, "Topic type is required!"]
                },
                topic_id:{
                    type: Schema.Types.ObjectId,
                    required: [true, "Topic ID is required!"]
                },
                skippable:{
                    type: Boolean,
                    default: true
                },
                xp: {
                    type: Number,
                    required: [true, "XP value is required!"],
                    min: [0, "XP must be non-negative."],
                },
            }
        ],
        default:[]
    }
});

lessonSchema.methods.add_topic = function (topic:ITopic){

    this.topics.push(topic)
    this.total_xp = this.topics.reduce((sum:number, t:ITopic)=> sum + t.xp, 0)
}


const Lesson = mongoose.model<ILesson>("Lesson", lessonSchema);
export default Lesson;