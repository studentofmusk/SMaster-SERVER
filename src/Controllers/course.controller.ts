import { Request, Response } from "express";
import { handleError } from "../Utils/errorHandler.js";
import { videoValidator } from "../Utils/Validator.js";
import { StatusCodes } from "http-status-codes";
import Video from "../Models/Video.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();


const s3 = new S3Client({ region: process.env.AWS_REGION! });

interface MulterS3File extends Express.Multer.File {
    location: string;
    key: string;
}

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
            action_id: Number(req.body.action_id), 
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