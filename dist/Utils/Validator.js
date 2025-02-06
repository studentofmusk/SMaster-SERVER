import { z } from "zod";
export const signupValidator = z.object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    age: z.number().int().min(5, "Age must be 18 or above").max(100, "Age must be less than 100"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    language: z.enum(["ASL"]),
});
export const loginValidator = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});
