import express from 'express';
import {Register,Login} from "../Controlers/authController.js";

const route = express.Router()
route.post("/register",Register)
route.post("/login",Login)

export default route;
