export const DEMO_GIF_URL =
  "https://github.com/ts-31/bookmydoctor/blob/main/demo.gif";

export const AI_UNAVAILABLE_REPLY = `I'm sorry, the AI assistant is temporarily unavailable due to API credit limits. You can watch the demo to see how it works: ${DEMO_GIF_URL}`;

export const isAiApiError = (error) => {
  const msg = (error?.message || String(error)).toLowerCase();
  return (
    msg.includes("xai_api_key") ||
    msg.includes("api key") ||
    msg.includes("credit") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("insufficient") ||
    msg.includes("billing") ||
    msg.includes("unauthorized") ||
    msg.includes("401") ||
    msg.includes("402") ||
    msg.includes("429")
  );
};
