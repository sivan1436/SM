import express from "express";
import authMiddleware from "../middlewares/authmiddleware.js";
import { getMessages, getUserById } from "../Controlers/messageControllers.js";

const router = express.Router();

router.get("/", authMiddleware, getMessages);
router.get("/users/:userId", authMiddleware, getUserById);

export default router;
