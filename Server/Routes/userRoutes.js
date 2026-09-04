import express from 'express';
import { EditUser, Findusers } from '../Controlers/userController.js';
import authMiddleware from '../middlewares/authmiddleware.js';
import profileUpload from '../middlewares/profileUpload.js';
const route = express.Router()
route.post("/search",Findusers)
route.put("/:id", authMiddleware, profileUpload, EditUser)

export default route;
