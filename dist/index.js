// Package Imports
import express from "express";
import dotenv from "dotenv";
// Initialization
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
// DataBase Connection
import "./DB/conn.js";
import auth_router from "./Routes/auth.routes.js";
//routes
app.use("/api/auth", auth_router);
// Environment variables
const PORT = process.env.PORT || 5000;
// Running server
app.listen(PORT, () => console.log(`server is listening at port ${PORT}`));
