var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User, { Gender } from "../Models/User.js";
import { signupValidator } from "../Utils/Validator.js";
import { logErrorToFile } from "../Utils/logger.js";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import bcriptjs from "bcryptjs";
export const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = signupValidator.parse(req.body);
        // Check user existance
        const isExist = yield User.findOne({
            email: validatedData.email
        });
        if (isExist)
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Email already exist!"
            });
        const salt = yield bcriptjs.genSalt(10);
        const newUser = new User({
            email: validatedData.email,
            password: yield bcriptjs.hash(validatedData.password, salt),
            first_name: validatedData.first_name,
            last_name: validatedData.last_name,
            age: validatedData.age,
            gender: Gender[validatedData.gender],
            current: { [validatedData.language]: "0.0.0" }
        });
        yield newUser.save();
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: "User created successfully!"
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
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
        logErrorToFile(error, "INTERNAL SERVER ERROR in SIGNUP API");
    }
});
// export const login = async(req: Request, res: Response): Promise<any> => {
//     try {
//         const validatedData = 
//     } catch (error) {
//     }
// }
