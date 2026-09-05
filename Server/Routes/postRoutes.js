import express from "express";
import {
	addComment,
	createPost,
	getFeeds,
	sharePost,
	toggleLike,
} from "../Controlers/postsControllr.js";
import authMiddleware from "../middlewares/authmiddleware.js";
import postUpload from "../middlewares/postUpload.js";

const route = express.Router();

route.get("/", authMiddleware, getFeeds);
route.post("/", authMiddleware, postUpload, createPost);
route.patch("/:postId/like", authMiddleware, toggleLike);
route.post("/:postId/comments", authMiddleware, addComment);
route.post("/:postId/share", authMiddleware, sharePost);

export default route;
