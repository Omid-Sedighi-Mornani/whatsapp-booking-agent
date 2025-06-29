import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { createEvent } from "../agent/agent.js";
import { addEvent } from "../calendar/booking.js";

const { Client, LocalAuth } = pkg;

export const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath:
      "/Users/omidsedighi-mornani/.cache/puppeteer/chrome/mac_arm-138.0.7204.49/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  },
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("authenticated", (clientSession) => {
  console.log(clientSession);
  console.log("Successfully authenticated client!");
});

client.on("auth_failure", (msg) => {
  console.error("Auth failure:", msg);
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message", async (message) => {
  const event = await createEvent(message.body);
  console.log(event);
  await addEvent(event);
  client.sendMessage(message.from, "Deine Stunde wurde geplant!");
});
