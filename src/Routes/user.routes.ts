import { Router } from "express";
import { auth } from "../Middlewares/auth.middleware.js";
import { get_user_profile, update_level } from "../Controllers/user.controller.js";
const user_routes = Router();
user_routes.get("/profile", auth, get_user_profile);
user_routes.post("/update-level", auth, update_level);

export default user_routes;