/**
 * test-ai.js
 * Standalone script to verify the Grok + LangChain + LangGraph pipeline.
 *
 * Run with: node test-ai.js
 * This script does NOT depend on Express or MongoDB. It is purely for
 * confirming that the AI foundation is wired up correctly.
 */

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/mongodb.js";
import { getGrokLLM } from "./services/ai/llm.js";
import { runAIGraph } from "./services/ai/graph.js";

const TEST_PROMPT = "Hello! Briefly describe what you can help with.";
const TOOL_PROMPT = "Can you show me a list of dermatologists?";

const runTests = async () => {
  console.log("=".repeat(50));
  console.log("  BookMyDoctor — AI Foundation Test");
  console.log("=".repeat(50));

  await connectDB();

  // ── Test 1: Direct LLM connection ──────────────────
  console.log("\n[Test 1] Direct Grok LLM connection...");
  try {
    const llm = getGrokLLM();
    const response = await llm.invoke(TEST_PROMPT);
    console.log("✅ LLM Response:", response.content);
  } catch (err) {
    console.error("❌ LLM Test Failed:", err.message);
    process.exit(1);
  }

  const dummyUserData = { name: "Test User", email: "test@example.com" };

  // ── Test 2: Full LangGraph pipeline (No tools) ─────
  console.log("\n[Test 2] LangGraph pipeline (user input → LLM node → output)...");
  try {
    const messages = [{ role: "user", content: TEST_PROMPT }];
    const result = await runAIGraph(messages, "dummyUserId", dummyUserData);
    console.log("✅ Graph Response:", result);
  } catch (err) {
    console.error("❌ Graph Test Failed:", err.message);
    process.exit(1);
  }

  // ── Test 3: LangGraph pipeline (With tools) ────────
  console.log("\n[Test 3] LangGraph pipeline with tools (asking for doctors)...");
  try {
    const messages = [{ role: "user", content: TOOL_PROMPT }];
    const result = await runAIGraph(messages, "dummyUserId", dummyUserData);
    console.log("✅ Graph Response with Tools:", result);
  } catch (err) {
    console.error("❌ Graph Tool Test Failed:", err.message);
    process.exit(1);
  }

  // ── Test 4: LangGraph pipeline (System Prompt Context) ──
  console.log("\n[Test 4] LangGraph pipeline checking user context...");
  try {
    const messages = [{ role: "user", content: "What is my name and email?" }];
    const result = await runAIGraph(messages, "dummyUserId", dummyUserData);
    console.log("✅ Graph Response for Context:", result);
  } catch (err) {
    console.error("❌ Graph Context Test Failed:", err.message);
    process.exit(1);
  }

  // ── Test 5: LangGraph pipeline (Partial Booking Flow) ─
  console.log("\n[Test 5] LangGraph pipeline checking partial booking flow...");
  try {
    const messages = [{ role: "user", content: "I want to book an appointment with Dr. Meera Patel." }];
    const result = await runAIGraph(messages, "dummyUserId", dummyUserData);
    console.log("✅ Graph Response for Partial Booking:\n", result);
  } catch (err) {
    console.error("❌ Graph Partial Booking Test Failed:", err.message);
    process.exit(1);
  }

  console.log("\n" + "=".repeat(50));
  console.log("  All tests passed! AI foundation is ready.");
  console.log("=".repeat(50) + "\n");
  
  mongoose.connection.close();
};

runTests();
