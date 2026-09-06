import express from "express";
import { createStory, deleteStory, getStories } from "../Controlers/storyController.js";
import authMiddleware from "../middlewares/authmiddleware.js";
import postUpload from "../middlewares/postUpload.js";

const route = express.Router();

route.get("/", authMiddleware, getStories);
route.post("/", authMiddleware, postUpload, createStory);
route.delete("/:storyId", authMiddleware, deleteStory);

export default route;
