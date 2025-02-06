import { Router } from "express";
import { auth } from "../Middlewares/auth.middleware.js";
const user_routes = Router();

user_routes.get("/", auth, (req, res)=>{
    res.status(200).json({
        success: true,
        message: "hello world"
    })
})

export default user_routes;