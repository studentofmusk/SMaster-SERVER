import { Request, Response } from "express";
import { handleError } from "../Utils/errorHandler.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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





export const predict_action = async (req: Request, res: Response):Promise<any>=>{
    try {
        // const validatedData =
        res.status(200);
          
    } catch (error) {
        handleError(error, res, 'Error in PREDICT API');
    }
};