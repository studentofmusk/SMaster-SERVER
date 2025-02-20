import { Router } from "express";
import { uploadVideo } from "../Utils/upload.js";
import { add_group, add_lesson, add_season, add_topic, create_group, create_language, create_lecture, create_lesson, create_season, create_t2action, create_t2video, create_v2action, create_v2text, create_video, delete_lecture, delete_t2action, delete_t2video, delete_v2action, delete_v2text, delete_video, get_groups, get_languages, get_lectures, get_lessons, get_seasons, get_t2action, get_t2video, get_v2action, get_v2text, get_videos, update_lesson } from "../Controllers/course.controller.js";
const course_routes = Router();

course_routes.post("/create-video", uploadVideo, create_video);
course_routes.post("/create-lecture", create_lecture);
course_routes.post("/create-v2text", create_v2text);
course_routes.post("/create-t2video", create_t2video);
course_routes.post("/create-v2action", create_v2action);
course_routes.post("/create-t2action", create_t2action);
course_routes.post("/create-language", create_language);
course_routes.post("/create-season", create_season);
course_routes.post("/create-group", create_group);
course_routes.post("/create-lesson", create_lesson);

course_routes.post("/add-season", add_season);
course_routes.post("/add-group", add_group);
course_routes.post("/add-lesson", add_lesson);
course_routes.post("/add-topic", add_topic);

course_routes.post("/update-lesson", update_lesson);

course_routes.post("/delete-video", delete_video);
course_routes.post("/delete-lecture", delete_lecture);
course_routes.post("/delete-v2text", delete_v2text);
course_routes.post("/delete-t2video", delete_t2video);
course_routes.post("/delete-v2action", delete_v2action);
course_routes.post("/delete-t2action", delete_t2action);

course_routes.get("/get-languages", get_languages);
course_routes.get("/get-seasons", get_seasons);
course_routes.get("/get-groups", get_groups);
course_routes.get("/get-lessons", get_lessons);
course_routes.get("/get-videos", get_videos);
course_routes.get("/get-lectures", get_lectures);
course_routes.get("/get-v2text", get_v2text);
course_routes.get("/get-t2video", get_t2video);
course_routes.get("/get-v2action", get_v2action);
course_routes.get("/get-t2action", get_t2action);

export default course_routes;