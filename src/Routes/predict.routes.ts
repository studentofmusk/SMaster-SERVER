import { Router } from "express";
import { predict_action, upload } from "../Controllers/predict.controller.js";
const predict_routes = Router();

predict_routes.post("/predict-action", upload.single("video"), predict_action);

export default predict_routes;