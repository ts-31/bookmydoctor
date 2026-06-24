/**
 * graph.js
 * Minimal LangGraph workflow definition for the BookMyDoctor AI pipeline.
 */

import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getGrokLLM } from "./llm.js";

const llmNode = async (state) => {
  console.log(`  [LangGraph] Invoking Grok LLM with ${state.messages.length} messages in context...`);
  const llm = getGrokLLM();
  const response = await llm.invoke(state.messages);
  console.log(`  [LangGraph] Grok LLM returned response.`);
  return { messages: [response] };
};

export const buildAIGraph = () => {
  const graph = new StateGraph(MessagesAnnotation)
    .addNode("llmNode", llmNode)
    .addEdge("__start__", "llmNode")
    .addEdge("llmNode", "__end__");

  return graph.compile();
};

/**
 * Runs the AI graph with the full conversation history.
 *
 * @param {Array<{role: string, content: string}>} messageHistory - The array of historical messages.
 * @returns {Promise<string>} The AI's text response.
 */
export const runAIGraph = async (messageHistory) => {
  const compiledGraph = buildAIGraph();

  // Convert raw DB objects into LangChain Message instances
  const langchainMessages = messageHistory.map((msg) =>
    msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
  );

  const result = await compiledGraph.invoke({
    messages: langchainMessages,
  });

  const finalMessages = result.messages;
  return finalMessages[finalMessages.length - 1].content;
};
