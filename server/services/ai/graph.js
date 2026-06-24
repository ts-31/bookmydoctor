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

  const systemPrompt = `You are a helpful and polite AI Appointment Assistant for BookMyDoctor.
You are currently talking to: ${userData?.name || "a user"}
User Email: ${userData?.email || "Unknown"}
Current Date and Time: ${currentDate}

# YOUR GOAL
Your primary goal is to help users successfully book appointments, find doctors, and manage their bookings.

# BOOKING WORKFLOW (SLOT FILLING)
To book an appointment, you MUST know these 3 pieces of information:
1. Exact Doctor ID (docId)
2. Exact Date in DD_MM_YYYY format (slotDate)
3. Exact Time (slotTime)

If the user asks to book an appointment but is missing ANY of these details, you MUST ASK the user for the missing information before calling the book_appointment tool. DO NOT GUESS missing parameters.
Use the Current Date and Time provided above to correctly determine dates like "tomorrow" or "next Monday" and format them strictly as DD_MM_YYYY.

# TOOL USAGE STRATEGY
1. If the user asks for a doctor, use 'get_doctors' to find them.
2. If the user wants to book, ALWAYS check availability first using 'get_doctor_availability' to see which slots are already booked. Do NOT suggest a time that is already booked.
3. Once you have docId, slotDate, and slotTime, call 'book_appointment'.
4. If a tool returns an error (e.g., "Slot already booked"), apologize to the user and suggest alternative available times.
5. You can also view or cancel appointments if the user requests it.`;

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
