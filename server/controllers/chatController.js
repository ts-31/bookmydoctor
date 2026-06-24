import chatModel from "../models/chatModel.js";

// Helper to generate responsive mock responses on the backend
const generateMockResponse = (userMessage) => {
  const msg = userMessage.toLowerCase();
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return "Hello! I am your AI assistant. How can I help you today?";
  } else if (msg.includes("appointment") || msg.includes("book") || msg.includes("schedule")) {
    return "I can help you book an appointment! Please navigate to the 'Doctors' page or check your existing bookings in 'My Appointments'.";
  } else if (msg.includes("doctor") || msg.includes("specialty") || msg.includes("specialist")) {
    return "We have doctors specialized in General Medicine, Pediatrics, Dermatology, Gynaecology, and more. You can view all our doctors on the 'Doctors' page.";
  } else if (msg.includes("profile") || msg.includes("my account")) {
    return "You can view and update your details on the 'My Profile' page.";
  } else {
    return `I received your message: "${userMessage}". I am currently in demo mode, but soon I'll be fully integrated to help you schedule appointments, find specialists, and manage your health records!`;
  }
};

// API to add a new message to the user's chat history and generate a response
const addMessage = async (req, res) => {
  try {
    const { userId } = req.user; // Extracted from auth middleware
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID is missing.",
      });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Invalid payload: Message content is required.",
      });
    }

    const newMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    const replyText = generateMockResponse(message);
    const newReply = {
      role: "assistant",
      content: replyText,
      timestamp: new Date(),
    };

    // Find the chat document for this user and push both the new user message and the AI reply.
    // If it doesn't exist, upsert: true will create it.
    const chat = await chatModel.findOneAndUpdate(
      { userId },
      {
        $push: { messages: { $each: [newMessage, newReply] } },
        $set: { lastActiveAt: Date.now() }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Message stored and response generated successfully.",
      chatId: chat._id,
      reply: replyText,
    });

  } catch (error) {
    console.error("Error in addMessage:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while storing the message.",
    });
  }
};

// API to get chat history for a user
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.user; // Extracted from auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID is missing.",
      });
    }

    const chat = await chatModel.findOne({ userId });

    res.status(200).json({
      success: true,
      messages: chat ? chat.messages : [],
    });

  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving chat history.",
    });
  }
};

export { addMessage, getChatHistory };

