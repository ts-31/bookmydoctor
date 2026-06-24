import express from "express";
import { addMessage, getChatHistory } from "../controllers/chatController.js";
import authUser from "../middlewares/authUser.js";

const chatRouter = express.Router();

// Apply authUser middleware to ensure only authenticated users can get/post messages
chatRouter.get("/history", authUser, getChatHistory);
chatRouter.post("/message", authUser, addMessage);

export default chatRouter;
