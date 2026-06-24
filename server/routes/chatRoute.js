import express from "express";
import authUser from "../middlewares/authUser.js";
import { handleChatMessage, getChatHistory } from "../controllers/chatController.js";

const router = express.Router();

router.post("/message", authUser, handleChatMessage);
router.get("/history", authUser, getChatHistory);

export default router;
