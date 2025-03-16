import { Request, Response } from "express";
import { handleError } from "../Utils/errorHandler.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { predictValidator } from "../Utils/Validator.js";
import { StatusCodes } from "http-status-codes";
import { fileURLToPath } from "url";
import FormData from "form-data";
import axios from "axios";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "uploads");
if(!fs.existsSync(UPLOADS_DIR)){
    fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
})

export const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

export const predict_action = async (req: Request, res: Response): Promise<any> => {
    try {
        const validatedData = predictValidator.parse(req.body);
        
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Video NOT FOUND!",
            });
        }

        // Use the existing saved file path
        const filePath = path.join(__dirname, "uploads", req.file.filename);

        // Create FormData using form-data package
        const formData = new FormData();
        formData.append("video", fs.createReadStream(filePath));
        formData.append("label", validatedData.action_id.toString()); // Ensure label is a string

        const response = await axios.post("http://localhost:5001/predict", formData, {
            headers: formData.getHeaders(), // Ensures correct Content-Type
        });

        // Delete the file after sending
        fs.unlinkSync(filePath);

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Action Predicted!",
            data: response.data.label_found,
        });

    } catch (error) {
        handleError(error, res, "Error in PREDICT API");
    }
};