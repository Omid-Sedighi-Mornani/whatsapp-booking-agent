import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import process from "process";
import { handleMessage } from "./messagehandler.js";
const { Client, LocalAuth } = pkg;

const CHROMIUM_PATH = process.env.CHROMIUM_PATH;

export const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: CHROMIUM_PATH,
  },
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("authenticated", () => {
  console.log("Successfully authenticated client!");
});

client.on("auth_failure", (msg) => {
  console.error("Auth failure:", msg);
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message", async (message) => {
  const replyMessage = await handleMessage(message.from, message.body);
  client.sendMessage(message.from, replyMessage);
});
