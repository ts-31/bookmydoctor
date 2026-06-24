import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
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
      <div className="bg-primary p-4 flex items-center justify-between text-white">
        <div>
          <h3 className="font-semibold text-lg">AI Assistant</h3>
          <p className="text-xs text-primary-50 opacity-80">Online | Ready to help</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close Chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="animate-spin" size={16} />
            AI is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
