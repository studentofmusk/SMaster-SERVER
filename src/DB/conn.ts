import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()
mongoose.connect(process.env.DB!)
.then(()=>console.log("DB Connected!"))
.catch((err)=>console.log(`DB Connection Failed!\n${err.message}`))