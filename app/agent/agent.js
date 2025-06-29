import {
  entityExtractorInstructions,
  followUpInstructions,
} from "./instructions.js";
import { Agent, run } from "@openai/agents";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function createEvent(inputText) {
//   const whatsappAgent = new Agent({
//     name: "WhatsApp Agent",
//     instructions,
//     model: "gpt-4.1-nano-2025-04-14",
//   });

//   const result = await run(whatsappAgent, inputText);

//   return JSON.parse(result.finalOutput);
// }

export async function extractFields(inputText) {
  const whatsappAgent = new Agent({
    name: "Entity Extractor",
    instructions: entityExtractorInstructions,
    model: "gpt-4.1-nano-2025-04-14",
  });

  const result = await run(whatsappAgent, inputText);

  return JSON.parse(result.finalOutput);
}

export async function generateFollowUp(missingFields) {
  const whatsappAgent = new Agent({
    name: "Follow Up Agent",
    instructions: followUpInstructions,
    model: "gpt-4.1-nano-2025-04-14",
  });

  const result = await run(whatsappAgent, missingFields.join(", "));

  return result.finalOutput;
}
