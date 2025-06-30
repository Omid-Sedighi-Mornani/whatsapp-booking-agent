import {
  entityExtractorInstructions,
  followUpInstructions,
  bookingVerifierInstructions,
} from "./instructions.js";
import { OpenAI } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractFields(messages, entities) {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: entityExtractorInstructions(entities) },
      ...messages,
    ],
    temperature: 0,
    response_format: { type: "json_object" },
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
    temperature: 0.7,
  });

  const result = completion.choices[0].message.content;

  return result;
}

export async function checkIfBookingConfirmed(messages) {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: bookingVerifierInstructions },
      ...messages.slice(-2),
    ],
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "confirmed_schema",
        schema: {
          type: "object",
          properties: {
            confirmed: { type: "boolean" },
            reason: { type: "string" },
          },
          required: ["confirmed"],
        },
      },
    },
  });

  const result = JSON.parse(completion.choices[0].message.content);
  const bookingConfirmed = result.confirmed;

  return bookingConfirmed;
}
