import { runAIGraph } from "../services/ai/graph.js";
import chatModel from "../models/chatModel.js";

/**
 * Handle incoming chat messages and return the AI response.
 * Uses chatModel to persist the history.
 */
export const handleChatMessage = async (req, res) => {
  try {
    // extract userId from req.user (set by authUser middleware)
    const userId = req.user?.userId || req.body?.userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // 1. Fetch or create chat document for user
    let chat = await chatModel.findOne({ userId });
    if (!chat) {
      chat = new chatModel({ userId, messages: [] });
    }

    // 2. Append new user message to DB document
    const userMsgObj = { role: "user", content: message };
    chat.messages.push(userMsgObj);
    chat.lastActiveAt = Date.now();

    console.log(`\n[AI Chat] Received user message: "${message}"`);
    console.log(`[AI Chat] Forwarding to LangGraph/Grok with ${chat.messages.length} total messages...`);

    // 3. Pass FULL message history to LangGraph
    const aiResponseContent = await runAIGraph(chat.messages);

    console.log(`[AI Chat] Received AI response.`);

    // 4. Save AI response to DB
    const aiMsgObj = { role: "assistant", content: aiResponseContent };
    chat.messages.push(aiMsgObj);
    await chat.save();

    res.status(200).json({
      success: true,
      reply: aiResponseContent,
    });
  } catch (error) {
    console.error("Error in chat controller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

/**
 * Fetch chat history from DB for the frontend.
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const chat = await chatModel.findOne({ userId });

    res.status(200).json({
      success: true,
      messages: chat ? chat.messages : [], 
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
    });
  }
};
