import * as agent from "../agent/agent.js";
import * as manager from "./sessionmanager.js";
import { createEvent, checkAvailability } from "../calendar/booking.js";

export async function handleMessage(userId, message) {
  const session = await manager.getSession(userId);
  session.addMessage("user", message);

  try {
    const response = await agent.generateSessionResponse(session);
    const { entities, confirmed, reply: replyMessage } = response.resp;
    session.entities = entities;
    session.addMessage("assistant", replyMessage);

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
