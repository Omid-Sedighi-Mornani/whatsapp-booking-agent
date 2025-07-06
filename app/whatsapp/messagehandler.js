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
    session.addMessage("assistant", replyMessage);

    if (intent == "suggest_times") {
      const { date } = session.entities;
      const relevantDate = new Date(date ?? BOOKING_OPTIONS.firstAllowedDate);
      const isValidDate =
        isInBookingRange(relevantDate) &&
        BOOKING_OPTIONS.allowedWeekDays.includes(relevantDate.getDay());

      if (!isValidDate) {
        return `Das Buchungsdatum mindestens am ${format(
          UTCtoTimeZone(BOOKING_OPTIONS.firstAllowedDate),
          "dd.MM.yyyy"
        )} zwischen ${BOOKING_OPTIONS.workingHours.start} und ${
          BOOKING_OPTIONS.workingHours.end
        } liegen und an folgenden Tagen erfolgen: ${BOOKING_OPTIONS.allowedWeekDays
          .map((dayNum) => days[dayNum])
          .join(", ")}`;
      }

      const freeSlots = await suggestFreeSlotsForDate(relevantDate);
      return formatFreeTimeSlots(freeSlots, "Europe/Berlin");
    }

    if (confirmed) {
      const available =
        checkForValidDate(session.entities) &&
        (await checkAvailability(session.entities));

      if (!available) {
        return "Der Termin ist leider nicht frei! Sagen Sie einfach _'Schlage mir Termine für *<Datum>* vor'_.";
      }

      await createEvent(session.entities);
      SessionManager.deleteSession(userId);
      return replyMessage;
    }

    SessionManager.saveSession(userId, session);

    return replyMessage;
  } catch (error) {
    console.error(error);
    SessionManager.deleteSession(userId);
    return "Leider ist ein Fehler augetreten, starten Sie bitte die Buchung von neu!";
  }
}
