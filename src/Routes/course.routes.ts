import { Router } from "express";
import { uploadVideo } from "../Utils/upload.js";
import { create_video } from "../Controllers/course.controller.js";
const course_routes = Router();

course_routes.post("/create-video", uploadVideo, create_video);

export default course_routes;