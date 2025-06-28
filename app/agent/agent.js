import instructions from "./instructions.js";
import { Agent, run } from "@openai/agents";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createEvent(inputText) {
  const whatsappAgent = new Agent({
    name: "WhatsApp Agent",
    instructions,
    model: "gpt-4.1-nano-2025-04-14",
  });

  const result = await run(whatsappAgent, inputText);

  return JSON.parse(result.finalOutput);
}
