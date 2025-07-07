import process from "process";
import { authorize } from "./auth.js";
import "dotenv/config";
import path from "path";
import fs from "fs";
import { google } from "googleapis";
import {
  addToDateTime,
  addToTime,
  timeStringToDecimal,
  toUTC,
} from "../utils/datetime.js";
import { BOOKING_OPTIONS } from "../index.js";
import { DateTime } from "luxon";

const CREDENTIALS_PATH = path.join(process.cwd(), process.env.CREDENTIALS_PATH);
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

const oAuth2Client = await authorize(credentials);
const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

// adding events

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
  await addEvent(event);
}

async function addEvent(event) {
  const res = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });
  console.log("Termin wurde erfolgreich erstellt:", res.data.htmlLink);
}

// checking for existing events

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

export async function getEvents(dateStr, dateObj) {
  const timeMin = new Date(dateStr);
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

// calculating free slots from events

async function getFreeTimeSlots(events, rangeStartStr, rangeEndStr) {
  const sorted = events
    .map((e) => ({
      start: new Date(e.start),
      end: new Date(e.end),
    }))
    .sort((a, b) => a.start - b.start);

  console.log("getFreeTimeSlots:\n", events);

  const freeSlots = [];

  const rangeStart = new Date(rangeStartStr ?? sorted[0].start);
  const rangeEnd = new Date(rangeEndStr ?? sorted[sorted.length - 1].end);

  let lastEnd = rangeStart;

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
  });

  if (lastEnd < new Date(rangeEnd)) {
    freeSlots.push({
      start: lastEnd.toISOString(),
      end: rangeEnd.toISOString(),
    });
  }

  return freeSlots;
}

export async function suggestFreeSlotsForDate(
  date,
  start_time = BOOKING_OPTIONS.workingHours.start,
  end_time = BOOKING_OPTIONS.workingHours.end
) {
  const [startHours, startMinutes] = timeStringToDecimal(start_time);
  const [endHours, endMinutes] = timeStringToDecimal(end_time);

  const lowerBound = DateTime.fromISO(date.toISOString(), {
    zone: BOOKING_OPTIONS.timeZone,
  })
    .set({ hour: startHours, minute: startMinutes, second: 0, millisecond: 0 })
    .toISO();
  const upperBound = DateTime.fromISO(date.toISOString(), {
    zone: BOOKING_OPTIONS.timeZone,
  })
    .set({ hour: endHours, minute: endMinutes, second: 0, millisecond: 0 })
    .toISO();

  const blockedEvents = await getEvents(date, {
    days: 1,
  });

  const freeSlots = await getFreeTimeSlots(
    blockedEvents,
    lowerBound,
    upperBound
  );

  console.log("suggestFreeSlotsForDate:\n", freeSlots);
  console.log("date:", date);
  console.log(
    "hours, minutes:",
    [startHours, startMinutes],
    [endHours, endMinutes]
  );
  console.log("Upper bound: ", upperBound);
  console.log("Lower bound: ", lowerBound);

  return freeSlots;
}
