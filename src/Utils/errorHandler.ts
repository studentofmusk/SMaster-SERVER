import { Response } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { logErrorToFile } from "./logger.js"; 
import jwt from "jsonwebtoken";
const {TokenExpiredError} = jwt;
export const handleError = (error: unknown, res: Response, customMessage: string) => {
    if (error instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid Request!",
            error: error.errors
        });
    }
    else if (error instanceof TokenExpiredError){
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Token Expired!"
        });
    }
    

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "INTERNAL SERVER ERROR!"
    });

    logErrorToFile(error as Error, customMessage);
};
