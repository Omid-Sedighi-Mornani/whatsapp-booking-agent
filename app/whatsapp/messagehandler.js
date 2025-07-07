import * as agent from "../agent/agent.js";
import { SessionManager } from "./sessionmanager.js";
import {
  createEvent,
  checkAvailability,
  suggestFreeSlotsForDate,
} from "../calendar/booking.js";
import {
  checkForValidDate,
  formatFreeTimeSlots,
  isInBookingRange,
  UTCtoTimeZone,
} from "../utils/datetime.js";
import { BOOKING_OPTIONS } from "../index.js";
import { format } from "date-fns";

const days = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

export async function handleMessage(userId, message) {
  const session = await SessionManager.getSession(userId);
  session.addMessage("user", message);

  try {
    const response = await agent.generateSessionResponse(session);
    const { entities, confirmed, reply: replyMessage, intent } = response.resp;
    session.entities = entities;
    session.confirmed = confirmed;
    session.addMessage("assistant", replyMessage);

    if (intent == "suggest_times") {
      return await suggestTimes(session);
    }

    if (intent == "booking") {
      return await proceedBooking(session);
    }
  } catch (error) {
    SessionManager.deleteSession(userId);
    console.log(error);
    return "Leider ist ein Fehler augetreten, starten Sie bitte die Buchung von neu!";
  }
}

async function suggestTimes(session) {
  const { firstAllowedDate, workingHours, allowedWeekDays } = BOOKING_OPTIONS;

  const userMessage = () =>
    `Das Buchungsdatum mindestens am ${format(
      UTCtoTimeZone(firstAllowedDate),
      "dd.MM.yyyy"
    )} zwischen ${workingHours.start} und ${
      workingHours.end
    } und an folgenden Tagen liegen: ${allowedWeekDays
      .map((dayNum) => days[dayNum])
      .join(", ")}`;

  const { date } = session.entities;
  const relevantDate = new Date(date ?? firstAllowedDate);
  const isValidDate =
    isInBookingRange(relevantDate) &&
    allowedWeekDays.includes(relevantDate.getDay());

  if (!isValidDate) {
    return userMessage();
  }

  const freeSlots = await suggestFreeSlotsForDate(relevantDate);
  return formatFreeTimeSlots(freeSlots);
}

async function proceedBooking(session) {
  if (session.confirmed) {
    const available =
      checkForValidDate(session.entities) &&
      (await checkAvailability(session.entities));

    SessionManager.deleteSession(session.userId);
    if (!available) {
      return "Der Termin ist leider nicht frei! Sagen Sie einfach _'Schlage mir Termine für *<Datum>* vor'_.";
    }
    await createEvent(session.entities);
  } else {
    SessionManager.saveSession(session.userId, session);
  }

  return session.messages[session.messages.length - 1].content;
}
