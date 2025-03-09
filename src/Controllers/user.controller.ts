import { StatusCodes } from "http-status-codes";
import User from "../Models/User.js";
import { handleError } from "../Utils/errorHandler.js";
import { Request, Response } from "express";
import { updateLevelValidator } from "../Utils/Validator.js";
import Language from "../Models/Language.js";
import Season from "../Models/Season.js";
import Group from "../Models/Group.js";
import Lesson from "../Models/Lesson.js";

export const get_user_profile = async (req: Request, res: Response):Promise<any>=>{
    try {
        const USER = await User.findById((req as any).user_id).lean();
        if(!USER) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `USER NOT FOUND!`
        });

        const {password, token, ...userData} = USER;
        res.status(StatusCodes.OK).json({
            success: true,
            message: `User fetch successfully!`,
            data: userData
        });
        
    } catch (error) {
        handleError(error, res, 'Error in GET USER PROFILE API');
    }
};

export const update_level = async (req: Request, res: Response):Promise<any>=>{
    try {
        const validatedData = updateLevelValidator.parse(req.body);
        const USER = await User.findById((req as any).user_id);
        if(!USER) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `User NOT FOUND!`
        });
        
        const LANGUAGE = await Language.findById(validatedData.language_id);
        if(!LANGUAGE) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `Language NOT FOUND!`
        });
        
        let [season, group, lesson] = validatedData.current;

        const SEASON = await Season.findById(LANGUAGE.seasons[season]);
        if(!SEASON) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `Season NOT FOUND!`
        });
        
        const GROUP = await Group.findById(SEASON.groups[group]);
        if(!GROUP) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `Group NOT FOUND!`
        });
        
        const LESSON = await Lesson.findById(GROUP.lessons[lesson]);
        if(!LESSON) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `Lesson NOT FOUND!`
        });
        

        if(GROUP.lessons.length - 1 <= lesson){
            lesson = 0;
            if(SEASON.groups.length - 1 <= group){
                group = 0;
                if(LANGUAGE.seasons.length - 1 <= season){
                    // Not 
                }else{
                    season += 1
                }
            }else{
                group += 1;
            }
        }else{
            lesson += 1;
        }

        // console.log(`${season}.${group}.${lesson}`);

        USER.current = USER.current || new Map();
        USER.current.set(LANGUAGE.title, `${season}.${group}.${lesson}`);   
        USER.xp += validatedData.xp;

        await USER.save();

        const {password, token, ...userData} = USER;

        res.status(StatusCodes.OK).json({
            success: true,
            message: `Level updated!`,
            data:userData
        });

    } catch (error) {
        handleError(error, res, 'Error in UPDATE LEVEL API');
    }
};