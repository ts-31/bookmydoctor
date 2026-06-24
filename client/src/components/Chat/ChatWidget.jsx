import React, { useState, useEffect, useContext } from "react";
import { MessageCircle } from "lucide-react";
import ChatWindow from "./ChatWindow";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

const DEMO_GIF_URL =
  "https://github.com/ts-31/bookmydoctor/blob/main/demo.gif";

const AI_UNAVAILABLE_REPLY = `I'm sorry, the AI assistant is temporarily unavailable due to API credit limits. You can watch the demo to see how it works: ${DEMO_GIF_URL}`;

const INITIAL_MESSAGES = [
  {
    id: "init-1",
    text: "Hello! I am your AI assistant. How can I help you today?",
    sender: "ai",
  },
];

const ChatWidget = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);

  // Load chat history when component mounts or token changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!token) {
        setMessages(INITIAL_MESSAGES);
        return;
      }
      try {
        const { data } = await axios.get(`${backendUrl}/api/chat/history`, {
          headers: { token },
        });
        if (data.success && data.messages && data.messages.length > 0) {
          const mappedMessages = data.messages.map((msg, index) => ({
            id: msg._id || `${index}-${Date.now()}`,
            text: msg.content,
            sender: msg.role === "user" ? "user" : "ai",
          }));
          setMessages(mappedMessages);
        } else {
          setMessages(INITIAL_MESSAGES);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setMessages(INITIAL_MESSAGES);
      }
    };

    fetchChatHistory();
  }, [token, backendUrl]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async (text) => {
    // 1. Add User Message to UI instantly
    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);

    // 2. If no token, show login prompt
    if (!token) {
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: "Please log in to chat with the AI assistant and book appointments.",
          sender: "ai",
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // 3. Send to Backend and process reply
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/chat/message`,
        { message: text },
        { headers: { token } }
      );

      if (data.reply) {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: data.reply,
          sender: "ai",
        };
        setMessages((prev) => [...prev, aiResponse]);
      } else {
        throw new Error("Failed to get response from assistant");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const fallbackReply =
        error.response?.data?.reply ||
        (error.response?.status === 503 ? AI_UNAVAILABLE_REPLY : null);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: fallbackReply || AI_UNAVAILABLE_REPLY,
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window with Transitions */}
      <div
        className={`transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 mb-4"
            : "scale-0 opacity-0 pointer-events-none absolute"
        }`}
      >
        <ChatWindow
          onClose={() => setIsOpen(false)}
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
        />
      </div>

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg transition-transform duration-300 hover:scale-105 flex items-center justify-center ${
          isOpen ? "scale-0 opacity-0 absolute" : "scale-100 opacity-100"
        }`}
        aria-label="Open AI Chat"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

export default ChatWidget;
