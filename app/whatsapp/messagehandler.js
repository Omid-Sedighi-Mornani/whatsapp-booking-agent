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
} from "../utils/datetime.js";
import { BOOKING_OPTIONS } from "../index.js";

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
      const relevantDate = date ?? BOOKING_OPTIONS.firstAllowedDate;
      const isValidDate = isInBookingRange(new Date(relevantDate));

      if (!isValidDate) {
        return `Das Buchungsdatum muss ${BOOKING_OPTIONS.bookingDaysPrior} Tage zuvor und zwischen ${BOOKING_OPTIONS.workingHours.start} und ${BOOKING_OPTIONS.workingHours.end} liegen!`;
      }

      const freeSlots = await suggestFreeSlotsForDate(relevantDate);
      return formatFreeTimeSlots(freeSlots, "Europe/Berlin");
    }

    if (confirmed) {
      const available =
        checkForValidDate(session.entities) &&
        (await checkAvailability(session.entities));

      if (!available) {
        return "Der Termin ist leider nicht frei! Sage einfach _'Schlage mir Termine für *<Datum>* vor'_.";
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
