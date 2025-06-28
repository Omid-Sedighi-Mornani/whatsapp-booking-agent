import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: "gpt-4.1-nano-2025-04-14",
  input: "Das ist eine kleine Test-Nachricht!",
});

console.log(response.output_text);
