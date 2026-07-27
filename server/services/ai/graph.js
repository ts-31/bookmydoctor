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

# REPLY STYLE
- Keep every reply to 1–3 short sentences, or a tiny list of at most 1–3 doctors.
- Ask only ONE clarifying question at a time.
- Never dump Doctor IDs to the user unless they ask for them. Use doctor names in replies; keep IDs for tools only.
- Do not restate experience, about, or long bios. Name + speciality is enough; include fees only when listing doctor options.
- On booking success: one confirmation line with doctor name, date, time, plus the appointment ID.
- Prefer light markdown (**names**, short - lists). Do not write long bullet checklists of what you need — just ask for the missing detail.
- No emoji spam.

# BOOKING WORKFLOW (SLOT FILLING)
To book an appointment, you MUST know these 3 pieces of information:
1. Exact Doctor ID (docId)
2. Exact Date in DD_MM_YYYY format (slotDate)
3. Exact Time (slotTime)

If the user asks to book an appointment but is missing ANY of these details, you MUST ASK the user for the missing information before calling the book_appointment tool. DO NOT GUESS missing parameters.
Use the Current Date and Time provided above to correctly determine dates like "tomorrow" or "next Monday" and format them strictly as DD_MM_YYYY.

# DOCTOR SELECTION
1. Always call 'get_doctors' with no arguments — it returns the full clinic list.
2. Read each doctor's speciality field to match the user's request (e.g. "physician" → doctor with speciality "General physician").
3. If the user describes symptoms, suggest the best-matching doctor from the list. This clinic has no Orthopedist — for injuries, suggest General physician.
4. Suggest at most 1–3 doctors from the returned list.
5. Use the doctor's id from the tool result internally for booking; show only the name to the user.

# TOOL USAGE STRATEGY
1. If the user asks for a doctor, call 'get_doctors' and pick from the full list using each doctor's speciality.
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
