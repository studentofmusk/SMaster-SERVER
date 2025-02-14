import mongoose from "mongoose";
import {z} from "zod";

export const signupValidator = z.object({
    first_name: z.string().min(2, "First name is required").trim(),
    last_name: z.string().min(2, "Last name is required").trim(),
    email: z.string().email("Invalid email format").trim(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    age: z.number().int().min(5, "Age must be 18 or above").max(100, "Age must be less than 100"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    language: z.enum(["ASL"]),
    otp: z.string().min(6, "OTP must have exactly 6 digits").max(6, "OTP must have exactly 6 digits")
})
export const loginValidator = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const changePasswordValidator = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    token: z.string()
});

export const emailValidator = z.object({
    email: z.string().email("Invalid email format")
});

export const videoValidator = z.object({    
    title: z.string()
        .min(1, "Title is required!")
        .max(100, "Title must be under 100 characters.")
        .transform((val: string)=>val.toLowerCase().trim()),
    
    action_id: z.string()
        .refine((val) => !isNaN(Number(val)), {
            message: "Action ID must be a number!",
        })
        .transform((val) => Number(val))
        .refine((val)=> val>= 0, {
            message: "action_id must be possitive value!"
        }),

    url: z.string()
        .url("Invalid video URL!")
        .refine((val) => val.endsWith(".mp4"), {
            message: "Only .mp4 videos are allowed!",
        }),

    thumbnail: z.string()
        .url("Invalid thumbnail URL!")
        .refine((val) => /\.(jpg|jpeg|png)$/i.test(val), {
            message: "Only JPG, JPEG, or PNG images are allowed for thumbnails!",
        }),

    audio: z.string()
        .url("Invalid audio URL!")
        .refine((val) => val.endsWith(".mp3"), {
            message: "Only .mp3 files are allowed for audio!",
        }),
});

export const lectureValidator = z.object({
    title: z.string()
        .min(1, "Title is required!")
        .max(100, "Title must be under 100 characters.")
        .transform((val: string)=>val.toLowerCase().trim()),
    video: z.string()
        .refine((val:string)=>mongoose.isValidObjectId(val), {
            message: "Invalid Video ID! Please check it."
        })
});

export const v2TextValidator = z.object({
    title: z.string()
        .min(1, "Title is required!")
        .max(100, "Title must be under 100 characters.")
        .transform((val: string)=>val.toLowerCase().trim()),
    video: z.string()
        .refine((val:string)=>mongoose.isValidObjectId(val), {
            message: "Invalid Video ID! Please check it."
        }),
    options: z.array(z.string().min(1, "Option cannot be empty!").toLowerCase().trim()).length(4),
}).refine((obj)=>obj.options.includes(obj.title), {
    message: "Options does not contain answer! please check it again."
});

export const t2VideoValidator = z.object({
    title: z.string()
        .min(1, "Title is required!")
        .toLowerCase()
        .trim(),
    options: z.array(z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message:"Invalid Video ID in options"
    })).length(4).refine((options)=>new Set(options).size === options.length, {
        message: "Duplicate Video IDs are not allowed in options"
})
})
