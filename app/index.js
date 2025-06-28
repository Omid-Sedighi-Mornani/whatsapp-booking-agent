import "dotenv/config";
import readline from "readline";
import process from "process";
import { createEvent } from "./agent/agent.js";
import { addEvent } from "./calendar/booking.js";

const waitForInput = (msg) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(msg, (input) => {
      resolve(input);
      rl.close();
    });
  });
};

const userInput = await waitForInput("Terminbuchung eingeben\n");
const event = await createEvent(userInput);
addEvent(event);
