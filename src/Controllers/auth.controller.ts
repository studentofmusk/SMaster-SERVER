import User, { Gender } from "../Models/User.js"
import {Request, Response} from "express";
import { changePasswordValidator, emailValidator, signupValidator } from "../Utils/Validator.js";
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
        
        const otp = await OTP.findOne({
            email: validatedData.email
        });
        if(!otp || otp.otp !== validatedData.otp) return res.status(StatusCodes.BAD_GATEWAY).json({
            success: false,
            message: "Invalid OTP!"
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
            data: {token}
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

        console.log("OTP:", otp);
        res.status(StatusCodes.OK).json({ 
            success: true,
            message: "OTP sent successfully" 
        });

    } catch (error) {
        handleError(error, res, "Error in SEND OTP");
    }
}

export const forgotPassword = async(req: Request, res: Response): Promise<any> =>{
    try {
        const validatedData = emailValidator.parse(req.body);

        const USER = await User.findOne({email: validatedData.email});
        if(!USER) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "User Not Found! Please check your email address."
        });

        
        const payload = {
            user_id: USER._id
        }
        const token = jwt.sign(payload, process.env.SECRETKEY!, {expiresIn: "15m"});

        const sent = await sendMail({
            from: "SMaster Security",
            to: validatedData.email,
            subject:"Forgot Password",
            text: `Click here to change your password: http://${process.env.DOMAIN}/change-password?token=${token} \nThis Link will be valid until 15 Minutes. Please Don't share the link!`,
            html: `
            <h1>Change Password</h1>
            <div>
                 <a href="http://${process.env.DOMAIN}/change-password?token=${token}">Click here</a> to change your password.
            </div>
            <div>
            This Link will be valid until <B>15 Minutes</B>. Please <span style="color:'red'">Don't share</span> the link!
            </div>
            `
        });

        if(!sent) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Unable to sent mail!"
        });
        console.log("Token:", token);

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Mail sent to your email! please check your mail box."
        });

    } catch (error) {
        handleError(error, res, "Error in FORGOT PASSWORD API");
    }
}

export const changePassword = async(req: Request, res: Response): Promise<any> => {
    try {
        const validatedData = changePasswordValidator.parse(req.body);
        
        const data = jwt.verify(validatedData.token, process.env.SECRETKEY!);
        if(!data || typeof data !== "object" || !data.user_id){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid Token! Try again with valid token."
            });
        }

        const USER = await User.findById(data.user_id);
        if(!USER) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Invalid User ID!"
        });

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(validatedData.password, salt);

        await USER.change_password(hash);

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Password Changed successfully!"
        });

    } catch (error) {
        handleError(error, res, "Errorn in CHANGE PASSWORD API")
    }
}