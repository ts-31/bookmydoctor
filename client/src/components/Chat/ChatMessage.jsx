import React from "react";
import { User, Bot } from "lucide-react";

const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
        <div
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div
          className={`px-4 py-2 rounded-2xl text-sm ${
            isUser
              ? "bg-primary text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
          }`}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
