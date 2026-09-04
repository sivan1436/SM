import express from "express";
import { getMessages } from "../Controlers/messageControllers.js";

const router = express.Router();

router.get("/", getMessages);

export default router;
