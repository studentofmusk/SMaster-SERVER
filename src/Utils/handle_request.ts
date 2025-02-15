import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const request_error_handler = (err: any, req: Request, res: Response, next: NextFunction): any=>{
    if (err instanceof SyntaxError && "body" in err){
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid JSON Format!"
        });
    }
    next();
}