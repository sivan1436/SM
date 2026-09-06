import express from "express";
import authMiddleware from "../middlewares/authmiddleware.js";
import messageUpload from "../middlewares/messageUpload.js";

import {
  getMessages,
  getUserById,
  getConversation,
  sendMessage,
  markMessagesSeen,
} from "../Controlers/messageControllers.js";

const router = express.Router();

router.get("/", authMiddleware, getMessages);

router.get(
  "/users/:userId",
  authMiddleware,
  getUserById
);

router.get(
  "/:userId",
  authMiddleware,
  getConversation
);

router.post(
  "/:userId",
  authMiddleware,
  messageUpload,
  sendMessage
);

// Mark received messages as seen
router.put(
  "/:userId/seen",
  authMiddleware,
  markMessagesSeen
);

export default router;
