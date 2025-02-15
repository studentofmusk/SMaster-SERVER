import { Router } from "express";
import { uploadVideo } from "../Utils/upload.js";
import { add_season, create_language, create_lecture, create_season, create_t2action, create_t2video, create_v2action, create_v2text, create_video, get_languages, get_lectures, get_t2action, get_t2video, get_v2action, get_v2text, get_videos } from "../Controllers/course.controller.js";
const course_routes = Router();

course_routes.post("/create-video", uploadVideo, create_video);
course_routes.post("/create-lecture", create_lecture);
course_routes.post("/create-v2text", create_v2text);
course_routes.post("/create-t2video", create_t2video);
course_routes.post("/create-v2action", create_v2action);
course_routes.post("/create-t2action", create_t2action);
course_routes.post("/create-language", create_language);
course_routes.post("/create-season", create_season);

course_routes.post("/add-season", add_season);


course_routes.get("/get-languages", get_languages);
course_routes.get("/get-videos", get_videos);
course_routes.get("/get-lectures", get_lectures);
course_routes.get("/get-v2text", get_v2text);
course_routes.get("/get-t2video", get_t2video);
course_routes.get("/get-v2action", get_v2action);
course_routes.get("/get-t2action", get_t2action);

export default course_routes;