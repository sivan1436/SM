import express from "express";
import authMiddleware from "../middlewares/authmiddleware.js";
import { FollowUser } from "../Controlers/ConnectionController.js";

const route = express.Router();

route.post("/:userId/follow", authMiddleware, FollowUser);

export default route;
