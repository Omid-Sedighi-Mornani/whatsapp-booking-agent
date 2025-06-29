import "dotenv/config";
import { client } from "./whatsapp/client.js";

// const waitForInput = (msg) => {
//   return new Promise((resolve) => {
//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });
//     rl.question(msg, (input) => {
//       resolve(input);
//       rl.close();
//     });
//   });
// };

client.initialize();
