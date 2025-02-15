import { Router } from "express";
import { uploadVideo } from "../Utils/upload.js";
import { create_lecture, create_t2action, create_t2video, create_v2action, create_v2text, create_video, get_lectures, get_videos } from "../Controllers/course.controller.js";
const course_routes = Router();

course_routes.post("/create-video", uploadVideo, create_video);
course_routes.post("/create-lecture", create_lecture);
course_routes.post("/create-v2text", create_v2text);
course_routes.post("/create-t2video", create_t2video);
course_routes.post("/create-v2action", create_v2action);
course_routes.post("/create-t2action", create_t2action);


course_routes.get("/get-videos", get_videos)
course_routes.get("/get-lectures", get_lectures)

export default course_routes;