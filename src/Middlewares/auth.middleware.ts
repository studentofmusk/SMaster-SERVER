import { NextFunction, Request, Response } from "express";
import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import { handleError } from "../Utils/errorHandler.js";
import { StatusCodes } from "http-status-codes";

interface AuthRequest extends Request{
    user_id?:any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any>=>{
    const token = req.header("Authorization")?.split(" ")[1];
    
    if(!token) return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Access denied. Please Login!"
    });

    try {

        const decoded: any = jwt.verify(token, process.env.SECRETKEY!);

        if(!decoded || typeof decoded !== "object" || !decoded.user_id){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid Token! Please Login again."
            })
        }


        const USER = await User.findById(decoded.user_id);

        if(!USER) return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Unauthorized Request, Please Login!"            
        });
        if(USER.token !== token){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Sesson Expired! Login again."
            })
        }

        req.user_id = USER._id;
        next();
        
    } catch (error) {
        handleError(error, res, "Error in Auth Middleware");
    }
}