import { Request, Response } from "express";
import { handleError } from "../Utils/errorHandler.js";
import { addGroupValidator, addSeasonValidator, createGroupValidator, createSeasonValidator, languageValidator, lectureValidator, t2ActionValidator, t2VideoValidator, v2ActionValidator, v2TextValidator, videoValidator } from "../Utils/Validator.js";
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

        const LANGUAGE = await Language.findOne({title:validatedData.language});
        if(!LANGUAGE) return res.status(StatusCodes.BAD_REQUEST).json({
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

// -------------- Create T2Video -------------------
export const create_t2video = async(req: Request, res: Response): Promise<any>=>{
    try {
        const validatedData = t2VideoValidator.parse(req.body);
        
        let VIDEO;
        for (let i=0; i < 4; i++){
            VIDEO = await Video.findById(validatedData.options[i]);
            if(!VIDEO) return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Video Not Found!"
            });
        }

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

// -------------- Create T2Video -------------------
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

// -------------- Create T2Video -------------------
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
                error: validatedData.error,
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