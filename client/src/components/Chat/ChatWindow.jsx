import React, { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import ChatMessage from "./ChatMessage";

const ChatWindow = ({ onClose, messages, onSendMessage, isTyping }) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-[450px] w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden sm:w-[400px] sm:h-[500px]">
      {/* Header */}
      <div className="bg-primary px-4 py-3.5 flex items-center justify-between text-white">
        <div>
          <h3 className="font-semibold text-base">AI Assistant</h3>
          <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse" />
            Online
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close Chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 bg-gradient-to-b from-gray-50 to-emerald-50/30">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex w-full justify-start mb-3">
            <div className="flex items-end gap-2 max-w-[85%]">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-emerald-100 text-primary flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <div className="bg-white shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="px-3 py-3 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            aria-label="Send Message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
