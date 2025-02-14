import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { Request } from "express";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!
    },
});


const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME!,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (_req: Request, file, cb)=>{
            cb(null, `videos/${Date.now()}-${file.originalname}`);
        }
    })
})

export const uploadVideo = upload.fields([
    {name: "video", maxCount:1},
    {name: "thumbnail", maxCount:1},
    {name: "audio", maxCount:1}
]);

