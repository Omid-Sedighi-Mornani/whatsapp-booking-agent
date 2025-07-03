import { instructions, json_schema } from "./instructions.js";
import { OpenAI } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateSessionResponse(session) {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-nano-2025-04-14",
    messages: [{ role: "system", content: instructions }, ...session.messages],
    response_format: {
      type: "json_schema",
      json_schema: { schema: json_schema, name: "booking_schema" },
    },
  });

  const response = JSON.parse(completion.choices[0].message.content);

  return response;
}
