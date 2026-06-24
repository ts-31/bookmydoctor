/**
 * llm.js
 * Grok (xAI) LLM wrapper using the official @langchain/xai package.
 *
 * Uses ChatXAI which is the modern, non-deprecated LangChain interface
 * for the Grok API. Configured via environment variables.
 */

import { ChatXAI } from "@langchain/xai";

/**
 * Returns a configured instance of the Grok LLM.
 * Authentication is handled via the XAI_API_KEY environment variable.
 *
 * @returns {ChatXAI} A LangChain-compatible Grok chat model instance.
 */
export const getGrokLLM = () => {
  if (!process.env.XAI_API_KEY) {
    throw new Error(
      "[AI] XAI_API_KEY is not set. Please add it to your .env file."
    );
  }

  return new ChatXAI({
    apiKey: process.env.XAI_API_KEY,
    modelName: process.env.GROK_MODEL || "grok-2-latest",
    temperature: 0.3,
  });
};
