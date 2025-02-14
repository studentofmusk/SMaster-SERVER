import { Request, Response } from "express";
import { handleError } from "../Utils/errorHandler.js";
import { lectureValidator, t2VideoValidator, v2TextValidator, videoValidator } from "../Utils/Validator.js";
import { StatusCodes } from "http-status-codes";
import Video from "../Models/Video.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import Lecture from "../Models/Lecture.js";
import mongoose from "mongoose";
import V2Text from "../Models/V2Text.js";
import T2Video from "../Models/T2Video.js";
dotenv.config();
const s3 = new S3Client({ region: process.env.AWS_REGION! });

interface MulterS3File extends Express.Multer.File {
    location: string;
    key: string;
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


// --------------- GET METHODS ---------------------
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