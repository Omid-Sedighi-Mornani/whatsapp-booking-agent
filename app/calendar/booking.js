import process from "process";
import { authorize } from "./auth.js";
import "dotenv/config";
import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { addToDateTime, addToTime, toUTC } from "../utils/datetime.js";

const CREDENTIALS_PATH = path.join(process.cwd(), process.env.CREDENTIALS_PATH);
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

const oAuth2Client = await authorize(credentials);
const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

export async function createEvent(entities) {
  const { date, time: start_time, name, description } = entities;
  const end_time = addToTime(start_time, { minutes: 45 });

  const event = {
    summary: `Nachhilfestunde mit ${name}`,
    description: description || "",
    start: {
      dateTime: `${date}T${start_time}:00`,
      timeZone: "Europe/Berlin",
    },
    end: {
      dateTime: `${date}T${end_time}:00`,
      timeZone: "Europe/Berlin",
    },
    colorId: "6",
  };
  console.log(event);
  await addEvent(event);
}

export async function addEvent(event) {
  const res = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });
  console.log("Termin wurde erfolgreich erstellt:", res.data.htmlLink);
}

export async function checkAvailability({
  date,
  time,
  end_time = addToTime(time, { minutes: 45 }),
}) {
  const start_date = toUTC(`${date}T${time}`);
  const end_date = toUTC(`${date}T${end_time}`);
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: start_date,
    timeMax: end_date,
    singleEvents: true,
    timeZone: "Europe/Berlin",
  });

  const events = res.data.items;

  return events.length === 0;
}

export async function getEvents(dateObj) {
  const timeMin = new Date();
  const timeMax = addToDateTime(timeMin, dateObj);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    timeZone: "Europe/Berlin",
  });

  const events = res.data.items;

  return events.map((event) => ({
    start: event.start.dateTime,
    end: event.end.dateTime,
  }));
}

export async function getFreeTimeSlots(events) {
  const sorted = events
    .map((e) => ({
      start: new Date(e.start),
      end: new Date(e.end),
    }))
    .sort((a, b) => a.start - b.start);

  const freeSlots = [];

  let lastEnd = sorted[0].start;
  const rangeEnd = sorted[sorted.length - 1].end;

  sorted.forEach((event) => {
    if (event.start > lastEnd) {
      freeSlots.push({
        start: lastEnd.toISOString(),
        end: event.start.toISOString(),
      });
    }
    if (event.end > lastEnd) {
      lastEnd = event.end;
    }

    if (lastEnd < new Date(rangeEnd)) {
      freeSlots.push({
        start: lastEnd.toISOString(),
        end: rangeEnd.toISOString(),
      });
    }
  });

  return freeSlots;
}
