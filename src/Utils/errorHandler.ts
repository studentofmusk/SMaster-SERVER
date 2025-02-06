import { Response } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { logErrorToFile } from "./logger.js"; // Assuming you have a logger

export const handleError = (error: unknown, res: Response, customMessage: string) => {
    if (error instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid Request!",
            error: error.errors
        });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "INTERNAL SERVER ERROR!"
    });

    logErrorToFile(error as Error, customMessage);
};
