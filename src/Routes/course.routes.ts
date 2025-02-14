import { Router } from "express";
import { uploadVideo } from "../Utils/upload.js";
import { create_lecture, create_video, get_lectures, get_videos } from "../Controllers/course.controller.js";
const course_routes = Router();

course_routes.post("/create-video", uploadVideo, create_video);
course_routes.post("/create-lecture", create_lecture);


course_routes.get("/get-videos", get_videos)
course_routes.get("/get-lectures", get_lectures)

export default course_routes;