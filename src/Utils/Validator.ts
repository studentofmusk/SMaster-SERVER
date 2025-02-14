import {z} from "zod";

export const signupValidator = z.object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    age: z.number().int().min(5, "Age must be 18 or above").max(100, "Age must be less than 100"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    language: z.enum(["ASL"]),
    otp: z.string().min(6, "OTP must have exactly 6 digits").max(6, "OTP must have exactly 6 digits")
})
export const loginValidator = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export const changePasswordValidator = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    token: z.string()
})

export const emailValidator = z.object({
    email: z.string().email("Invalid email format")
})

export const videoValidator = z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Invalid URL format"),
    thumbnail: z.string().url("Invalid thumbnail URL format"),
    audio: z.string().url("Invalid audio URL format"),
    action_id: z.number().int().min(0, "Action ID must be a positive integer"),
  });