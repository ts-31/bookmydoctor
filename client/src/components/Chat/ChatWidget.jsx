import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatWindow from "./ChatWindow";

const INITIAL_MESSAGES = [
  {
    id: "init-1",
    text: "Hello! I am your AI assistant. How can I help you today?",
    sender: "ai",
  },
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = (text) => {
    // 1. Add User Message
    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    // 2. Simulate AI Processing
    setIsTyping(true);

    // Simulate network delay for AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: "I am a demo AI assistant. Backend integration is pending, so I can only echo that I received your message!",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
