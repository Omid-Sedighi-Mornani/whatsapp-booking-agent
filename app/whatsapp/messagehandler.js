import * as agent from "../agent/agent.js";
import * as manager from "./sessionmanager.js";
import { startOfToday } from "date-fns";
import {
  createEvent,
  checkAvailability,
  getFreeTimeSlots,
  getEvents,
} from "../calendar/booking.js";
import {
  addToDateTime,
  formatFreeTimeSlots,
  UTCtoTimeZone,
} from "../utils/datetime.js";

export async function handleMessage(userId, message) {
  const session = await manager.getSession(userId);
  session.addMessage("user", message);

  try {
    const response = await agent.generateSessionResponse(session);
    const { entities, confirmed, reply: replyMessage, intent } = response.resp;
    session.entities = entities;
    session.addMessage("assistant", replyMessage);

    if (intent == "suggest_times") {
      const todayDateStr = startOfToday().toISOString();
      const relevantDate = entities.date ?? todayDateStr;

      const lowerBound = addToDateTime(relevantDate, { hours: 9 });
      const upperBound = addToDateTime(relevantDate, { hours: 22 });

      const blockedEvents = await getEvents(relevantDate, {
        days: 1,
      });

      const freeSlots = await getFreeTimeSlots(
        blockedEvents,
        lowerBound,
        upperBound
      );

      return formatFreeTimeSlots(freeSlots, "Europe/Berlin");
    }

    if (confirmed) {
      const available = await checkAvailability(session.entities);

      if (!available) {
        return "Der Termin ist leider nicht frei! Sage einfach _'Schlage mir Termine für *<Datum>* vor'_.";
      }

      await createEvent(session.entities);
      manager.deleteSession(userId);
      return replyMessage;
    }

    manager.saveSession(userId, session);

    return replyMessage;
  } catch (error) {
    console.error(error);
    return "Leider ist ein Fehler augetreten, probieren Sie es noch einmal!";
  }
}
