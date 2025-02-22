import { Request, Response } from "express";
import { handleError } from "../Utils/errorHandler.js";
import { addGroupValidator, addLessonValidator, addSeasonValidator, addTopicValidator, createGroupValidator, createLessonValidator, createSeasonValidator, deleteLectureValidator, deleteT2ActionValidator, deleteT2VideoValidator, deleteV2ActionValidator, deleteV2TextValidator, deleteVideoValidator, languageValidator, lectureValidator, t2ActionValidator, t2VideoValidator, updateLessonValidator, v2ActionValidator, v2TextValidator, videoValidator } from "../Utils/Validator.js";
import { StatusCodes } from "http-status-codes";
import Video from "../Models/Video.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import Lecture from "../Models/Lecture.js";
import mongoose, { Types } from "mongoose";
import V2Text from "../Models/V2Text.js";
import T2Video from "../Models/T2Video.js";
import V2Action from "../Models/V2Action.js";
import T2Action from "../Models/T2Action.js";
import Language from "../Models/Language.js";
import Season from "../Models/Season.js";
import Group from "../Models/Group.js";
import Lesson, { ITopic, TopicTypes } from "../Models/Lesson.js";
dotenv.config();
const s3 = new S3Client({ region: process.env.AWS_REGION! });

interface MulterS3File extends Express.Multer.File {
    location: string;
    key: string;
}

// -------------- Create Language -------------------
export const create_language = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = languageValidator.parse(req.body);
        
        const isExist = await Language.findOne({title: validatedData.title});
        if(isExist) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Language Already Exist!"
        });
        
        const LANGUAGE = new Language(validatedData);
        await LANGUAGE.save()
        res.status(StatusCodes.CREATED).json({
            success: true,
            message:"Language created!"
        })
    } catch (error) {
        handleError(error, res, 'Error in CREATE LANGUAGE API');
    }
};

// -------------- Create Season ----------------------
export const create_season = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = createSeasonValidator.parse(req.body);

        const LANGUAGE = await Language.findById(validatedData.language_id);
        if(!LANGUAGE) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Language not found! check your [language_id]'
        });

        const isExist = await Season.findOne(validatedData);
        if(isExist) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `[${validatedData.title}] is already Exist!`
        });

        const newSeason = new Season(validatedData);
        await newSeason.save();
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Season created!',
            data:newSeason
        });
        
    } catch (error) {
        handleError(error, res, 'Error in CREATE SEASON API');
    }
};

export const add_season = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = addSeasonValidator.parse(req.body);

        const LANGUAGE = await Language.findById(validatedData.language_id);
        if(!LANGUAGE) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "LANGUAGE NOT FOUND!"
        });

        const SEASON = await Season.findById(validatedData.season_id);
        if(!SEASON) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "SEASON NOT FOUND!"
        });
        
        
        if(!SEASON.language_id.equals(LANGUAGE._id as Types.ObjectId)) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Language ID not match with Season\'s language ID'
        });

        // Check if the season is already in LANGUAGE.seasons
        if (LANGUAGE.seasons?.some((id) => id.equals(SEASON._id as Types.ObjectId))) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Season ID already exists!"
            });
        }
        

        LANGUAGE.add_season(SEASON._id as Types.ObjectId);
        await LANGUAGE.save();
        
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Season added!',
            data:LANGUAGE
        });

    } catch (error) {
        handleError(error, res, 'Error in ADD SEASON API');
    }
};

// -------------- Create Group ----------------------
export const create_group = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = createGroupValidator.parse(req.body);
        
        const SEASON = await Season.findById(validatedData.season_id);
        if(!SEASON) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid Season ID!'
        });
        
        const isExist = await Group.findOne(validatedData);
        if(isExist) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Group already exist!'
        });

        const newGroup = new Group(validatedData);
        await newGroup.save();
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Group created!',
            data:newGroup
        });
    } catch (error) {
        handleError(error, res, 'Error in CREATE GROUP API');
    }
};

export const add_group = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = addGroupValidator.parse(req.body);

        const SEASON = await Season.findById(validatedData.season_id);
        if(!SEASON) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid Season ID!'
        });

        const GROUP = await Group.findById(validatedData.group_id);
        if(!GROUP) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid Group ID!'
        });

        if(!GROUP.season_id.equals(SEASON._id as any)) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Season ID is not match with Group\'s season_id!'
        });

        SEASON.add_group(GROUP._id as Types.ObjectId);
        await SEASON.save();

        if(SEASON.groups?.some((id:Types.ObjectId)=>id.equals(GROUP._id as any))) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Group already exist!'
        });
        
        
        res.status(StatusCodes.BAD_REQUEST).json({
            success: true,
            message: `Group [${GROUP.title}] added in ${SEASON.title}!`,
            data:SEASON
        });
        

    } catch (error) {
        handleError(error, res, 'Error in ADD GROUP API');
    }
};

// -------------- Create Lesson ----------------------
export const create_lesson = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = createLessonValidator.parse(req.body);
        
        const GROUP = await Group.findById(validatedData.group_id);
        if(!GROUP) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid Group ID!'
        });

        const newLesson = new Lesson(validatedData);
        await newLesson.save();
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: `Lesson created!`,
            data:newLesson
        });
        

    } catch (error) {
        handleError(error, res, 'Error in CREATE LESSON API');
    }
};
export const add_lesson = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = addLessonValidator.parse(req.body);
        
        const LESSON = await Lesson.findById(validatedData.lesson_id);
        if(!LESSON) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Invalid Lesson ID!`
        });

        const GROUP = await Group.findById(validatedData.group_id);
        if(!GROUP) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Invalid Group ID!`
        });
        
        if(!LESSON.group_id.equals(GROUP._id as any)) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Group ID is not match with Lesson\'s group_id!`
        });
        
        GROUP.add_lesson(LESSON._id as Types.ObjectId);
        await GROUP.save();
        
        if(GROUP.lessons.some((id)=>id.equals(LESSON._id as Types.ObjectId))) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Lesson already exist!`
        });
        

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: `Lesson added into the Group [${GROUP.title}]!`,
            data:GROUP
        });

         
    } catch (error) {
        handleError(error, res, 'Error in ADD LESSON API');
    }
};
export const update_lesson = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = updateLessonValidator.parse(req.body);
        
        const LESSON = await Lesson.findById(validatedData.lesson_id);
        if(!LESSON) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `Lesson not found! please check Lesson ID.`
        });

        // Validate topics
        const invalidTopics:{success:boolean, message:string}[] = [];
        await Promise.all(
            validatedData.topics.map(async (topic, idx) => {
                let isExist;
                switch (topic.topic_type) {
                    case TopicTypes.LECTURE:
                        isExist = await Lecture.findById(topic.topic_id);
                        break;
                    case TopicTypes.V2TEXT:
                        isExist = await V2Text.findById(topic.topic_id);
                        break;
                    case TopicTypes.T2VIDEO:
                        isExist = await T2Video.findById(topic.topic_id);
                        break;
                    case TopicTypes.V2ACTION:
                        isExist = await V2Action.findById(topic.topic_id);
                        break;
                    case TopicTypes.T2ACTION:
                        isExist = await T2Action.findById(topic.topic_id);
                        break;
                    default:
                        invalidTopics.push({
                            success: false,
                            message: `Invalid Topic type! Index[${idx}].`,
                        });
                        return;
                }

                if (!isExist) {
                    invalidTopics.push({
                        success: false,
                        message: `Invalid Topic ID at ${topic.topic_type}! Index[${idx}].`,
                    });
                }
            })
        );

        // If any topic validation failed, return error
        if (invalidTopics.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: invalidTopics[0].message,
                errors: invalidTopics,
            });
        }

        LESSON.topics = validatedData.topics;
        await LESSON.save();
        
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: `Lesson updated successfully!`,
            data:LESSON
        });

    } catch (error) {
        handleError(error, res, 'Error in UPDATE LESSON API');
    }
};
export const add_topic = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = addTopicValidator.parse(req.body);

        const LESSON = await Lesson.findById(validatedData.lesson_id);
        if(!LESSON) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Invalid Lesson not found!`
        });

        let isExist;
        
        const topic = {...validatedData.topic}

        switch (topic.topic_type) {
            case TopicTypes.LECTURE:
                isExist = await Lecture.findById(topic.topic_id);
                break;
            case TopicTypes.V2TEXT:
                isExist = await V2Text.findById(topic.topic_id);
                break;
            case TopicTypes.T2VIDEO:
                isExist = await T2Video.findById(topic.topic_id);
                break;
            case TopicTypes.V2ACTION:
                isExist = await V2Action.findById(topic.topic_id);
                break;
            case TopicTypes.T2ACTION:
                isExist = await T2Action.findById(topic.topic_id);
                break;
            default:
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: `Invalid Topic type!`
                });
        }

        if(!isExist) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Invalid Topic ID at ${topic.topic_type}`
        });
        
        LESSON.add_topic(topic);
        await LESSON.save();

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: `Topic added at Lesson Type [${LESSON.lesson_type}]`,
            data:LESSON
        });
    } catch (error) {
        handleError(error, res, 'Error in ADD TOPICS API');
    }
};



// -------------- Create Lecture -------------------
export const create_lecture = async(req: Request, res: Response): Promise<any>=>{
    try {
        const validatedData = lectureValidator.parse(req.body);

        const isExist = await Lecture.findOne({title: validatedData.title});
        if(isExist) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Lecture already exist!"
        })
        
        const VIDEO = await Video.findById(validatedData.video);
        if(!VIDEO) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Video Not Found!"
        });

        const newLecture = new Lecture(validatedData);
        await newLecture.save();
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: `New Lecture created [${validatedData.title}]`
        })
    } catch (error) {
        handleError(error, res, "Error in CREATE LECTURE API");
    }
}

export const delete_lecture = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = deleteLectureValidator.parse(req.body);
        
        const LECTURE = await Lecture.findById(validatedData.lecture_id);

        if(!LECTURE) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `Lecture ID not found!, Please check.`
        });

        const LESSONs = await Lesson.find({
            "topics.topic_type":TopicTypes.LECTURE,
            "topics.topic_id":LECTURE._id
        })
        if (LESSONs.length) return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: `LECTURE is already in use! Please delete all associated LESSONs before removing this LECTURE.`,
            errors:{
                LESSONs
            }
        });
        
        const deleteResult = await LECTURE.deleteOne();
        if(!deleteResult.deletedCount) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `Failed to delete LECTURE.`
        });
        
        res.status(StatusCodes.OK).json({
            success: true,
            message: `LECTURE deleted successfully!`,
            data:LECTURE
        });
    } catch (error) {
        handleError(error, res, 'Error in DELETE LECTURE API');
    }
};

// -------------- Create V2Text -------------------
export const create_v2text = async(req: Request, res: Response): Promise<any>=>{
    try {
        const validatedData = v2TextValidator.parse(req.body);
        
        const VIDEO = await Video.findById(validatedData.video);
        if(!VIDEO) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Video Not Found!"
        });

        const newV2Text = new V2Text(validatedData);
        await newV2Text.save()
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: "V2Text created!",
            data: newV2Text
        });
        
    } catch (error) {
        handleError(error, res, "Error in CREATE V2TEXT API");
    }
}

export const delete_v2text = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = deleteV2TextValidator.parse(req.body);
        
        const V2TEXT = await V2Text.findById(validatedData.v2text_id);

        if(!V2TEXT) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `V2Text ID not found!, Please check.`
        });

        const LESSONs = await Lesson.find({
            "topics.topic_type":TopicTypes.V2TEXT,
            "topics.topic_id":V2TEXT._id
        })
        if (LESSONs.length) return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: `V2TEXT is already in use! Please delete all associated LESSONs before removing this V2TEXT.`,
            errors:{
                LESSONs
            }
        });
        
        const deleteResult = await V2TEXT.deleteOne();
        if(!deleteResult.deletedCount) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `Failed to delete V2TEXT.`
        });
        
        res.status(StatusCodes.OK).json({
            success: true,
            message: `V2TEXT deleted successfully!`,
            data:V2TEXT
        });
    } catch (error) {
        handleError(error, res, 'Error in DELETE V2TEXT API');
    }
};

// -------------- Create T2Video -------------------
export const create_t2video = async(req: Request, res: Response): Promise<any>=>{
    try {
        const validatedData = t2VideoValidator.parse(req.body);
        
        let isTitleExist = false;
        let VIDEO;
        for (let i=0; i < 4; i++){
            VIDEO = await Video.findById(validatedData.options[i]);
            if(!VIDEO) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Video Not Found!"
            });

            if(VIDEO.title === validatedData.title) isTitleExist = true;
        }

        if(!isTitleExist) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Title is not match with options!`
        });
        

        const newT2Video = new T2Video(validatedData);
        await newT2Video.save()
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: "T2Video created!",
            data: newT2Video
        });

    } catch (error) {
        handleError(error, res, "Error in CREATE V2TEXT API");
    }
}

export const delete_t2video = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = deleteT2VideoValidator.parse(req.body);
        
        const T2VIDEO = await T2Video.findById(validatedData.t2video_id);
        if(!T2VIDEO) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `T2Video ID not found!, Please check.`
        });

        const LESSONs = await Lesson.find({
            "topics.topic_type":TopicTypes.T2VIDEO,
            "topics.topic_id":T2VIDEO._id
        })
        if (LESSONs.length) return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: `T2VIDEO is already in use! Please delete all associated LESSONs before removing this T2VIDEO.`,
            errors:{
                LESSONs
            }
        });
        
        const deleteResult = await T2VIDEO.deleteOne();
        if(!deleteResult.deletedCount) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `Failed to delete T2VIDEO.`
        });
        
        res.status(StatusCodes.OK).json({
            success: true,
            message: `T2VIDEO deleted successfully!`,
            data:T2VIDEO
        });
    } catch (error) {
        handleError(error, res, 'Error in DELETE T2VIDEO API');
    }
};

// -------------- Create V2Action -------------------
export const create_v2action = async(req: Request, res: Response): Promise<any>=>{
    try {
        const validatedData = v2ActionValidator.parse(req.body);
        
        const isExist = await V2Action.findOne({title: validatedData.title});
        if (isExist) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `[${validatedData.title}] is already exist!`
        });

        const VIDEO = await Video.findById(validatedData.video);
        if(!VIDEO) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Video Not Found!"
        });
        
        const newV2Action = new V2Action(validatedData);
        await newV2Action.save()
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: "V2Action created!",
            data: newV2Action
        });

    } catch (error) {
        handleError(error, res, "Error in CREATE V2ACTION API");
    }
}

export const delete_v2action = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = deleteV2ActionValidator.parse(req.body);
        
        const V2ACTION = await V2Action.findById(validatedData.v2action_id);
        if(!V2ACTION) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `V2Action ID not found!, Please check.`
        });

        const LESSONs = await Lesson.find({
            "topics.topic_type":TopicTypes.V2ACTION,
            "topics.topic_id":V2ACTION._id
        })
        if (LESSONs.length) return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: `V2ACTION is already in use! Please delete all associated LESSONs before removing this V2ACTION.`,
            errors:{
                LESSONs
            }
        });
        
        const deleteResult = await V2ACTION.deleteOne();
        if(!deleteResult.deletedCount) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `Failed to delete V2ACTION.`
        });
        
        res.status(StatusCodes.OK).json({
            success: true,
            message: `V2ACTION deleted successfully!`,
            data:V2ACTION
        });
    } catch (error) {
        handleError(error, res, 'Error in DELETE V2ACTION API');
    }
};
// -------------- Create T2Action -------------------
export const create_t2action = async(req: Request, res: Response): Promise<any>=>{
    try {
        const validatedData = t2ActionValidator.parse(req.body);
        
        const isExist = await T2Action.findOne({title: validatedData.title});
        if (isExist) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `[${validatedData.title}] is already exist!`
        });

        const VIDEO = await Video.findById(validatedData.video);
        if(!VIDEO) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Video Not Found!"
        });
        
        const newT2Action = new T2Action(validatedData);
        await newT2Action.save()
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: "T2Action created!",
            data: newT2Action
        });

    } catch (error) {
        handleError(error, res, "Error in CREATE T2ACTION API");
    }
}

export const delete_t2action = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = deleteT2ActionValidator.parse(req.body);
        
        const T2ACTION = await T2Action.findById(validatedData.t2action_id);
        if(!T2ACTION) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `T2Action ID not found!, Please check.`
        });

        const LESSONs = await Lesson.find({
            "topics.topic_type":TopicTypes.T2ACTION,
            "topics.topic_id":T2ACTION._id
        })
        if (LESSONs.length) return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: `T2ACTION is already in use! Please delete all associated LESSONs before removing this T2ACTION.`,
            errors:{
                LESSONs
            }
        });
        
        const deleteResult = await T2ACTION.deleteOne();
        if(!deleteResult.deletedCount) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `Failed to delete T2ACTION.`
        });
        
        res.status(StatusCodes.OK).json({
            success: true,
            message: `T2ACTION deleted successfully!`,
            data:T2ACTION
        });
    } catch (error) {
        handleError(error, res, 'Error in DELETE T2ACTION API');
    }
};
// -------------- Create Video ---------------------
export const create_video = async(req: Request, res: Response): Promise<any>=>  {
    try {

        if (!req.files || typeof req.files !== "object") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "No files uploaded!",
            });
        }

        const files = req.files as {[key: string]: MulterS3File[]}

        // Validate presence of required files
        if (!files.video?.[0] || !files.thumbnail?.[0] || !files.audio?.[0]) {
            await deleteFiles(files);
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Video, audio, and thumbnail are required!",
            });
        }

        // Extract S3 URLs and prepare request body
        req.body = {
            ...req.body,
            thumbnail: files.thumbnail[0].location,
            url: files.video[0].location,
            audio: files.audio[0].location
        };

        const validatedData = videoValidator.safeParse(req.body);
        if(!validatedData.success){
            await deleteFiles(files); // 🔹 Cleanup uploaded files
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid data format!",
                errors: validatedData.error,
            });
        }

        const isExist = await Video.findOne({title: validatedData.data.title})
        
        if (isExist) {
                await deleteFiles(files);
                return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Video already exist!"
            });
        }

        const newVideo = new Video(validatedData.data);
        await newVideo.save();
        
        res.status(StatusCodes.CREATED).json({
            success: true, 
            message: "Video uploaded successfully!",
            data: newVideo
        });

    } catch (error) {
        await deleteFiles(req.files as { [key: string]: MulterS3File[] });
        handleError(error, res, "Error in CREATE VIDEO API");
    }
}

export const delete_video = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = deleteVideoValidator.parse(req.body);
        
        const VIDEO = await Video.findById(validatedData.video_id);
        if(!VIDEO) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `Video not found!, Please check video ID!`
        });

        // Fetch all dependent records in parallel
        const [LECTUREs, V2TEXTs, T2VIDEOs, T2ACTIONs, V2ACTIONs] = await Promise.all([
            Lecture.find({ video: VIDEO._id }),
            V2Text.find({ video: VIDEO._id }),
            T2Video.find({ options: { $in: [VIDEO._id] } }),
            T2Action.find({ video: VIDEO._id }),
            V2Action.find({ video: VIDEO._id })
        ]);

        if(LECTUREs.length || V2TEXTs.length || T2VIDEOs.length || V2ACTIONs.length || T2ACTIONs.length){
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: `Video is in use! Please delete all associated records before removing this video.`,
                errors:{
                    LECTUREs, V2TEXTs, T2VIDEOs, V2ACTIONs, T2ACTIONs
                } 
            });
        }

        // Extract file keys from video (Assuming VIDEO has `url`, `thumbnail`, and `audio` as S3 URLs)
        const fileKeys = [
            VIDEO.url.split(".amazonaws.com/")[1],  // Extracts S3 key from full URL
            VIDEO.thumbnail.split(".amazonaws.com/")[1],
            VIDEO.audio.split(".amazonaws.com/")[1]
        ].filter(Boolean); // Removes undefined/null values if any


        // Delete files from S3
        await deleteFilesWithKeys(fileKeys);
        
        
        const deleteResult = await VIDEO.deleteOne();
        if (!deleteResult.deletedCount) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: `Failed to delete video!`
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: `Video deletion successfull!`,
            data:VIDEO
        });
        
        
    } catch (error) {
        handleError(error, res, 'Error in DELETE VIDEO API');
    }
};

const deleteFiles = async (files: {[key: string]: MulterS3File[]}) =>{
    try {
        const deletePromises = Object.values(files)
        .flat()
        .map((file)=>{
            s3.send(
                new DeleteObjectCommand({
                    Bucket:process.env.AWS_BUCKET_NAME!,
                    Key: file.key,
                })
            )
        });

        await Promise.all(deletePromises);
        console.log("unused file deleted!");
    } catch (error) {
        console.log("Error deleting files from s3 : ", error);
    }
    
}

const deleteFilesWithKeys = async (fileKeys: string[]) => {
    try {
        if (fileKeys.length === 0) return;

        const deletePromises = fileKeys.map(key =>
            s3.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: key
            }))
        );

        await Promise.all(deletePromises);
        console.log("Files deleted from S3 successfully!");

    } catch (error) {
        console.error("Error deleting files from S3:", error);
    }
};


// --------------- GET METHODS ---------------------
export const get_languages = async(req: Request, res: Response): Promise<any>=>{
    try {
        const language_id = req.query.id;
        let data;
        if(language_id){
            if (! mongoose.isValidObjectId(language_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Language ID!"
            });
            
            data = await Language.findById(language_id);
            
        }else{
            data = await Language.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Languages",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET LANGUAGES API");
    }
}
export const get_seasons = async(req: Request, res: Response): Promise<any>=>{
    try {
        const season_id = req.query.id;
        let data;
        if(season_id){
            if (! mongoose.isValidObjectId(season_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Season ID!"
            });
            
            data = await Season.findById(season_id);
            
        }else{
            data = await Season.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Seasons",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET VIDEOS API");
    }
}
export const get_groups = async(req: Request, res: Response): Promise<any>=>{
    try {
        const group_id = req.query.id;
        let data;
        if(group_id){
            if (! mongoose.isValidObjectId(group_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Group ID!"
            });
            
            data = await Group.findById(group_id);
            
        }else{
            data = await Group.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Groups",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET GROUPS API");
    }
}
export const get_lessons = async(req: Request, res: Response): Promise<any>=>{
    try {
        const lesson_id = req.query.id;
        let data;
        if(lesson_id){
            if (! mongoose.isValidObjectId(lesson_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Lesson ID!"
            });
            
            data = await Lesson.findById(lesson_id);
            
        }else{
            data = await Lesson.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Lessons",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET LESSONS API");
    }
}
export const get_videos = async(req: Request, res: Response): Promise<any>=>{
    try {
        const video_id = req.query.id;
        let data;
        if(video_id){
            if (! mongoose.isValidObjectId(video_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Video ID!"
            });
            
            data = await Video.findById(video_id);
            
        }else{
            data = await Video.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Videos",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET VIDEOS API");
    }
}
export const get_lectures = async(req: Request, res: Response): Promise<any>=>{
    try {
        const lecture_id = req.query.id;
        let data;
        if(lecture_id){
            if (! mongoose.isValidObjectId(lecture_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Lecture ID!"
            });
            
            data = await Lecture.findById(lecture_id);
            
        }else{
            data = await Lecture.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Lectures",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET LECTURES API");
    }
}
export const get_v2text = async(req: Request, res: Response): Promise<any>=>{
    try {
        const v2text_id = req.query.id;
        let data;
        if(v2text_id){
            if (! mongoose.isValidObjectId(v2text_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid V2Text ID!"
            });
            
            data = await V2Text.findById(v2text_id);
            
        }else{
            data = await V2Text.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "V2Text",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET V2TEXT API");
    }
}
export const get_t2video = async(req: Request, res: Response): Promise<any>=>{
    try {
        const t2video_id = req.query.id;
        let data;
        if(t2video_id){
            if (! mongoose.isValidObjectId(t2video_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid T2Video ID!"
            });
            
            data = await T2Video.findById(t2video_id);
            
        }else{
            data = await T2Video.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "T2Video",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET T2VIDEO API");
    }
}
export const get_v2action = async(req: Request, res: Response): Promise<any>=>{
    try {
        const v2action_id = req.query.id;
        let data;
        if(v2action_id){
            if (! mongoose.isValidObjectId(v2action_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid V2Action ID!"
            });
            
            data = await V2Action.findById(v2action_id);
            
        }else{
            data = await V2Action.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "V2Action",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET V2ACTION API");
    }
}
export const get_t2action = async(req: Request, res: Response): Promise<any>=>{
    try {
        const t2video_id = req.query.id;
        let data;
        if(t2video_id){
            if (! mongoose.isValidObjectId(t2video_id)) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid T2Action ID!"
            });
            
            data = await T2Action.findById(t2video_id);
            
        }else{
            data = await T2Action.find();
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "T2Action",
            data: data
        })
    } catch (error) {
        handleError(error, res, "Error in GET T2ACTION API");
    }
}