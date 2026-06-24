/**
 * test-ai.js
 * Standalone script to verify the Grok + LangChain + LangGraph pipeline.
 *
 * Run with: node test-ai.js
 * This script does NOT depend on Express or MongoDB. It is purely for
 * confirming that the AI foundation is wired up correctly.
 */

import "dotenv/config";
import { getGrokLLM } from "./services/ai/llm.js";
import { runAIGraph } from "./services/ai/graph.js";

const TEST_PROMPT = "Hello! Briefly describe what you can help with.";

const runTests = async () => {
  console.log("=".repeat(50));
  console.log("  BookMyDoctor — AI Foundation Test");
  console.log("=".repeat(50));

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

  // ── Test 2: Full LangGraph pipeline ────────────────
  console.log("\n[Test 2] LangGraph pipeline (user input → LLM node → output)...");
  try {
    const result = await runAIGraph(TEST_PROMPT);
    console.log("✅ Graph Response:", result);
  } catch (err) {
    console.error("❌ Graph Test Failed:", err.message);
    process.exit(1);
  }

  console.log("\n" + "=".repeat(50));
  console.log("  All tests passed! AI foundation is ready.");
  console.log("=".repeat(50) + "\n");
};

runTests();
