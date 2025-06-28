import process from "process";
import { authorize } from "./auth.js";
import "dotenv/config";
import path from "path";
import fs from "fs";
import { google } from "googleapis";

const CREDENTIALS_PATH = path.join(process.cwd(), process.env.CREDENTIALS_PATH);
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

const oAuth2Client = await authorize(credentials);
const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

export async function addEvent(event) {
  calendar.events.insert(
    { calendarId: "primary", resource: event },
    (err, res) => {
      if (err) {
        console.error("Fehler beim Erstellen des Termins:", err);
        return;
      }
      console.log("Termin wurde erfolgreich erstellt:", res.data.htmlLink);
    }
  );
}
