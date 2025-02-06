import { Router} from "express";
import { login, signup, signupOtp } from "../Controllers/auth.controller.js";

// Initialize route
const auth_routes = Router();

auth_routes.post("/sign-up", signup);
auth_routes.post("/log-in", login);
auth_routes.post("/signup-otp", signupOtp);

export default auth_routes;