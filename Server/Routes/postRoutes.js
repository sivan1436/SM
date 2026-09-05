import express from "express";
import { createPost, getFeeds } from "../Controlers/postsControllr.js";
import authMiddleware from "../middlewares/authmiddleware.js";
import postUpload from "../middlewares/postUpload.js";

const route = express.Router();

route.get("/", authMiddleware, getFeeds);
route.post("/", authMiddleware, postUpload, createPost);

export default route;
