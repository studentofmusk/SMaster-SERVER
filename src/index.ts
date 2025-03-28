// Package Imports
import express from "express";
import dotenv from "dotenv";


// Initialization
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))
dotenv.config()

// DataBase Connection
import "./DB/conn.js"

// Route Imports
import auth_routes from "./Routes/auth.routes.js";
import user_routes from "./Routes/user.routes.js";
import course_routes from "./Routes/course.routes.js";
import { request_error_handler } from "./Utils/handle_request.js";
import predict_routes from "./Routes/predict.routes.js";

//routes
app.use("/api/auth", auth_routes);
app.use("/api/user", user_routes)
app.use("/api/course", course_routes)
app.use("/api/predict", predict_routes);

// middleware
app.use(request_error_handler);

// Environment variables
const PORT = process.env.PORT || 5000;


// Running server
app.listen(PORT, ()=>console.log(`server is listening at port ${PORT}`));