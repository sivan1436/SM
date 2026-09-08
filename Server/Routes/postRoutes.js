import express from "express";
import {
	addComment,
	getComments,
	createPost,
	deletePost,
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
route.get("/:postId/comments", authMiddleware, getComments);
route.post("/:postId/share", authMiddleware, sharePost);
route.delete("/:postId", authMiddleware, deletePost);

export default route;
