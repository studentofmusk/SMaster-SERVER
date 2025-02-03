import User, { Gender } from "../Models/User.js"
import {Request, Response} from "express";
import { signupValidator } from "../Utils/Validator.js";
import { logErrorToFile } from "../Utils/logger.js";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import bcriptjs from "bcryptjs";

export const signup = async(req: Request, res: Response): Promise<any> =>{
    try {
        const validatedData = signupValidator.parse(req.body);

        // Check user existance
        const isExist = await User.findOne({
            email:validatedData.email
        });
        if(isExist) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Email already exist!"
        });

        const salt = await bcriptjs.genSalt(10);
        const newUser = new User({
            email:validatedData.email,
            password: await bcriptjs.hash(validatedData.password, salt),
            first_name: validatedData.first_name,
            last_name: validatedData.last_name,
            age: validatedData.age,
            gender:Gender[validatedData.gender],
            current: {[validatedData.language]:"0.0.0"}
        });

        await newUser.save();
        res.status(StatusCodes.CREATED).json({
            success: true, 
            message: "User created successfully!"
        });

    } catch (error) {

        if(error instanceof z.ZodError){
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Request!",
                error: error.errors
            })
        }

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "INTERNAL SERVER ERROR!"
        })

        logErrorToFile(error as Error, "INTERNAL SERVER ERROR in SIGNUP API");
    }
}

export const login = async(req: Request, res: Response): Promise<any> => {
    try {
        const validatedData = 
    } catch (error) {
        
    }
}