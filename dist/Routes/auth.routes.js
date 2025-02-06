import { Router } from "express";
import { signup } from "../Controllers/auth.controller.js";
// Initialize route
const auth_router = Router();
auth_router.post("/sign-up", signup);
export default auth_router;
