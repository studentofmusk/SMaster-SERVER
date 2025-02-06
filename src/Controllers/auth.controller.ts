import User, { Gender } from "../Models/User.js"
import {Request, Response} from "express";
import { emailValidator, signupValidator } from "../Utils/Validator.js";
import { StatusCodes } from "http-status-codes";
import bcryptjs from "bcryptjs";
import { loginValidator } from '../Utils/Validator.js';
import { handleError } from "../Utils/errorHandler.js";
import jwt from "jsonwebtoken";
import { generateOTP, sendMail } from "../Utils/mailer.js";
import OTP from "../Models/OTP.js";

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

        const salt = await bcryptjs.genSalt(10);
        const newUser = new User({
            email:validatedData.email,
            password: await bcryptjs.hash(validatedData.password, salt),
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
        handleError(error, res, "Error in SIGNUP API")
    }
}

export const login = async(req: Request, res: Response): Promise<any> => {
    try {
        const validatedData = loginValidator.parse(req.body);

        const USER = await User.findOne({email: validatedData.email});
        if(!USER) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid email or password!"
        })
        
        const isMatch = await bcryptjs.compare(validatedData.password, USER.password)

        if(!isMatch ) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid email or password!"
        })

        let payload = {
            user_id:USER._id
        }
        let token = jwt.sign(payload, process.env.SECRETKEY!, {expiresIn:"30d"});
        
        await USER.update_token(token);
        
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Logged in Successfully!",
            token: token
        });

    } catch (error) {
        handleError(error, res, "Error in LOGIN API");
    }
}

export const signupOtp = async(req: Request, res: Response): Promise<any> =>{
    try {
        const validatedData = emailValidator.parse(req.body);
        
        // Generate OTP
        const otp = generateOTP();

        // Store OTP in DB
        await OTP.create({ email: validatedData.email, otp });

        // Send OTP via email
        const emailSent = await sendMail({
            from: "SMaster: OTP",
            to: validatedData.email,
            subject: "OTP for Sign Up [SMaster]",
            text: `Your OTP for signing up is ${otp}. This OTP is valid for 5 minutes.`,
            html: `<p>Your OTP for signing up is <strong>${otp}</strong>. This OTP is valid for 5 minutes.</p>`,
        });

        if (!emailSent) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to send OTP email"
            });
        }

        res.status(StatusCodes.OK).json({ 
            success: true,
            message: "OTP sent successfully" 
        });

    } catch (error) {
        handleError(error, res, "Error in SEND OTP");
    }
}