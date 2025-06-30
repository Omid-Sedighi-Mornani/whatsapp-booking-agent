import {
  entityExtractorInstructions,
  followUpInstructions,
  bookingVerifierInstructions,
} from "./instructions.js";
import { Agent, run } from "@openai/agents";
import { OpenAI } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractFields(messages, entities) {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-nano-2025-04-14",
    messages: [
      { role: "system", content: entityExtractorInstructions(entities) },
      ...messages,
    ],
  });

  const result = completion.choices[0].message.content;

  return JSON.parse(result);
}

export async function generateFollowUp(messages, missingFields) {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-nano-2025-04-14",
    messages: [
      { role: "system", content: followUpInstructions(missingFields) },
      ...messages,
    ],
  });

  const result = completion.choices[0].message.content;

  return result;
}

export async function checkIfBookingVerified(messages) {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-nano-2025-04-14",
    messages: [
      { role: "system", content: bookingVerifierInstructions },
      ...messages,
    ],
  });

  const result = completion.choices[0].message.content;

  const bookingVerified = result.toLowerCase().includes("true");

  return bookingVerified;
}
