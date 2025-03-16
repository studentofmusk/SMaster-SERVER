import mongoose from "mongoose";
import {z} from "zod";
import { LessonTypes, TopicTypes } from "../Models/Lesson.js";

// ----------------- Auth -------------------
const profiles = ["default.png", "male-1.png", "male-2.png", "male-3.png", "male-4.png", "male-5.png", "male-6.png", "female-1.png", "female-2.png", "female-3.png", "female-4.png", "female-5.png", "female-6.png"] 
export const signupValidator = z.object({
    first_name: z.string().min(2, "First name is required").trim(),
    last_name: z.string().min(2, "Last name is required").trim(),
    email: z.string().email("Invalid email format").trim(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    age: z
    .string()
    .transform((age) => parseInt(age, 10)) // Convert string to number
    .pipe(z.number().int().min(18, "Age must be 18 or above").max(100, "Age must be less than 100")),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    language: z.enum(["ASL"]),
    profile:z.string().refine((profile)=>profiles.includes(profile), {
        message:`Invalid Profile!`
    }),
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

// ----------------- Course -------------------

// Language
export const languageValidator = z.object({
    title: z.string().min(3, "Title must contain 3 characters!").toUpperCase().trim(),
})
// Season
export const createSeasonValidator = z.object({
    title: z.string().min(8, "Title should contain minimum 8 charecters. [Eg. Season N]").toUpperCase().trim(),
    language_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message:"Invalid Language ID!"
    })
});
export const addSeasonValidator = z.object({
    language_id:z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message: "Invalid Language ID!"}),
    season_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message: "Invalid Season ID!"
    })
})
export const updateSeasonValidator = z.object({
    season_id: z.string().refine((id)=>mongoose.isValidObjectId(id), {message: "Invalid Season ID!"}),
    groups: z.array(z.string().refine((id)=>mongoose.isValidObjectId(id), {message: "Invalid Group ID exist!"}).transform((id)=>new mongoose.Types.ObjectId(id)))
})
export const deleteSeasonValidator = z.object({
    season_id: z.string().refine((id)=>mongoose.isValidObjectId(id), {message: "Invalid Season ID!"})
})
// Group
export const createGroupValidator = z.object({
    title: z.string().min(4, "Title length more than 4").toLowerCase().trim(),
    season_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message:"Invalid Group ID"
    })
});
export const addGroupValidator = z.object({
    season_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message: "Invalid Season ID!"
    }),
    group_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message: "Invalid Group ID!"
    })
})
export const deleteGroupValidator = z.object({
    group_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message: "Invalid Group ID!"
    })
})
export const updateGroupValidator = z.object({
    group_id:z.string().refine((id)=>mongoose.isValidObjectId(id), {message: "Invalid Group ID!"}),
    lessons:z.array(z.string().refine((lesson_id)=>mongoose.isValidObjectId(lesson_id), {message: "Invalid Lesson ID in Lessons! Please check."}).transform((val)=>new mongoose.Types.ObjectId(val)))
})
// Lesson
export const createLessonValidator = z.object({
    group_id:z.string().refine((id)=>mongoose.isValidObjectId(id), 
    {message: "Invalid Group ID!"}),
    lesson_type: z.nativeEnum(LessonTypes, {
        message: "Invalid LESSON TYPE!"
    })
})
export const addLessonValidator = z.object({
    lesson_id:z.string().refine((id)=>mongoose.isValidObjectId(id), {message: "Invalid Lesson ID!"}),
    group_id:z.string().refine((id)=>mongoose.isValidObjectId(id), {message: "Invalid Lesson ID!"}),
})
export const updateLessonValidator = z.object({
    lesson_id: z.string().refine((id)=>mongoose.isValidObjectId(id), {message: "Invalid Lesson ID!"}),
    topics: z.array(z.object({
        topic_type: z.nativeEnum(TopicTypes),
        topic_id:z.string().refine((id)=>mongoose.isValidObjectId(id), {
            message: "Invalid Type ID!"
        }).transform((id)=>new mongoose.Types.ObjectId(id)),
        skippable:z.boolean(),
        xp:z.number().int().min(0, "XP value must be possitive!")
    }))
});
export const addTopicValidator = z.object({
    lesson_id: z.string().refine((id)=>mongoose.isValidObjectId(id), {message: "Invalid Lesson ID!"}),
    topic:z.object({
        topic_type: z.nativeEnum(TopicTypes),
        topic_id:z.string().refine((id)=>mongoose.isValidObjectId(id), {
            message: "Invalid Type ID!"
        }).transform((id)=>new mongoose.Types.ObjectId(id)),
        skippable:z.boolean(),
        xp:z.number().int().min(0, "XP value must be possitive!")
    })
})
export const deleteLessonValidator = z.object({
    lesson_id: z.string().refine((id)=>mongoose.isValidObjectId(id), {
        message:"Invalid Lesson ID!"
    })
})
// Lecture
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
export const deleteLectureValidator = z.object({
    lecture_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {message:"Invalid T2Video ID!"})
}) 
// V2Text
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
export const deleteV2TextValidator = z.object({
    v2text_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {message:"Invalid T2Video ID!"})
}) 
// T2Video
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
export const deleteT2VideoValidator = z.object({
    t2video_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {message:"Invalid T2Video ID!"})
}) 
// V2Action
export const v2ActionValidator = z.object({
    title: z.string()
        .min(1, "Title is required!")
        .toLowerCase()
        .trim(),
    video: z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message: "Invalid V2Action ID!",
    })
})
export const deleteV2ActionValidator = z.object({
    v2action_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {message:"Invalid V2Action ID!"})
}) 
// T2Action
export const t2ActionValidator = z.object({
    title: z.string()
        .min(1, "Title is required!")
        .toLowerCase()
        .trim(),
    video: z.string().refine((val)=>mongoose.isValidObjectId(val), {
        message: "Invalid V2Action ID!",
    })
})
export const deleteT2ActionValidator = z.object({
    t2action_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {message:"Invalid T2Action ID ID!"})
})
// Video
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
export const deleteVideoValidator = z.object({
    video_id: z.string().refine((val)=>mongoose.isValidObjectId(val), {message:"Invalid Video ID!"})
}) 


// User
export const updateLevelValidator = z.object({
    language_id: z.string().refine((id)=>mongoose.isValidObjectId(id), {
        message: "Invalid Language ID!"
    }),
    current:z.string().transform((level) =>
        level.split(".").map(Number)  // Convert each part to a number
    ).refine((levelArr) =>
        levelArr.length === 3 && levelArr.every(num => Number.isInteger(num) && num >= 0),
        { message: "Invalid Level" }
    ),
    xp: z.number().int().min(0, "Invalid XP")
})

export const predictValidator = z.object({
    action_id: z.string()
})
