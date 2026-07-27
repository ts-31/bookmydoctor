import React from "react";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

const markdownComponents = {
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-1.5 last:mb-0 list-disc pl-4 space-y-0.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-1.5 last:mb-0 list-decimal pl-4 space-y-0.5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-snug">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ href, children }) => {
    const isDemoLink = href?.includes("demo.gif");
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-all"
      >
        {isDemoLink ? "demo" : children}
      </a>
    );
  },
};

const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"} items-end gap-2`}
      >
        <div
          className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
            isUser ? "bg-primary text-white" : "bg-emerald-100 text-primary"
          }`}
        >
          {isUser ? <User size={14} /> : <Bot size={14} />}
        </div>
        <div
          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-white rounded-br-sm whitespace-pre-wrap"
              : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            message.text
          ) : (
            <ReactMarkdown components={markdownComponents}>{message.text}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
