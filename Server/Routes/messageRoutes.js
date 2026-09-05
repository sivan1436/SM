import express from "express";
import authMiddleware from "../middlewares/authmiddleware.js";
import messageUpload from "../middlewares/messageUpload.js";
import {
	getMessages,
	getUserById,
	getConversation,
	sendMessage,
} from "../Controlers/messageControllers.js";

const router = express.Router();

router.get("/", authMiddleware, getMessages);
router.get("/users/:userId", authMiddleware, getUserById);
router.get("/:userId", authMiddleware, getConversation);
router.post("/:userId", authMiddleware, messageUpload, sendMessage);

export default router;
