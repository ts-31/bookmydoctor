/**
 * graph.js
 * Minimal LangGraph workflow definition for the BookMyDoctor AI pipeline.
 */

import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { getGrokLLM } from "./llm.js";
import { tools } from "./tools/index.js";

const llmNode = async (state) => {
  console.log(`  [LangGraph] Invoking Grok LLM with ${state.messages.length} messages in context...`);
  const llm = getGrokLLM();
  const llmWithTools = llm.bindTools(tools);
  const response = await llmWithTools.invoke(state.messages);
  console.log(`  [LangGraph] Grok LLM returned response.`);
  return { messages: [response] };
};

const shouldContinue = (state) => {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
};

export const buildAIGraph = () => {
  const toolNode = new ToolNode(tools);

  const graph = new StateGraph(MessagesAnnotation)
    .addNode("llmNode", llmNode)
    .addNode("tools", toolNode)
    .addEdge("__start__", "llmNode")
    .addConditionalEdges("llmNode", shouldContinue)
    .addEdge("tools", "llmNode");

  return graph.compile();
};

/**
 * Runs the AI graph with the full conversation history.
 *
 * @param {Array<{role: string, content: string}>} messageHistory - The array of historical messages.
 * @param {string} userId - The ID of the authenticated user.
 * @param {Object} userData - The authenticated user's profile data (name, email, etc).
 * @returns {Promise<string>} The AI's text response.
 */
export const runAIGraph = async (messageHistory, userId, userData) => {
  const compiledGraph = buildAIGraph();

  // Create System Prompt with User Context
  const currentDate = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const systemPrompt = `You are a helpful and polite AI assistant for BookMyDoctor.
You are currently talking to: ${userData?.name || "a user"}
User Email: ${userData?.email || "Unknown"}
Current Date and Time: ${currentDate}

You have tools to check doctor availability, list doctors, book appointments, and check/cancel the user's appointments. 
When booking an appointment, ensure you use the exact date format required by the tools (DD_MM_YYYY) based on the Current Date.`;

  // Prepend SystemMessage, then convert raw DB objects into LangChain Message instances
  const langchainMessages = [
    new SystemMessage(systemPrompt),
    ...messageHistory.map((msg) =>
      msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    ),
  ];

  const result = await compiledGraph.invoke(
    { messages: langchainMessages },
    { configurable: { userId } } // Inject userId for tool context
  );

  const finalMessages = result.messages;
  return finalMessages[finalMessages.length - 1].content;
};
