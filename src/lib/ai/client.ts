import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export function getAIModel() {
  if (process.env.GROQ_API_KEY) {
    return groq("openai/gpt-oss-120b");
  }
  return openai("gpt-4o-mini");
}
