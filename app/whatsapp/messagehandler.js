import * as agent from "../agent/agent.js";
import * as manager from "./sessionmanager.js";
import { createEvent, checkAvailability } from "../calendar/booking.js";

export async function handleMessage(userId, message) {
  const session = await manager.getSession(userId);
  session.addMessage("user", message);

  session.logToConsole();

  const confirmed = await agent.checkIfBookingConfirmed(session.messages);
  session.setConfirmed(confirmed);

  if (!(session.isComplete() && session.isConfirmed())) {
    const newEntities = await agent.extractFields(
      session.messages,
      session.entities
    );
    session.addEntities(newEntities);
  }

  if (session.isConfirmed()) {
    const available = await checkAvailability(session.entities);
    if (!available) {
      manager.deleteSession(userId);
      return "Omid kann da leider nicht sorry!";
    }
    return tryCloseSession(session);
  }

  let replyMessage;

  if (session.isComplete()) {
    replyMessage = await generateConfirmationMessage(session.entities);
  } else {
    replyMessage = await agent.generateFollowUp(
      session.messages,
      session.getMissingEntities()
    );
  }

  session.addMessage("assistant", replyMessage);
  manager.saveSession(session.userId, session);

  return replyMessage;
}

async function generateConfirmationMessage(entities) {
  const { name, date, start_time } = entities;
  const replyMessage = `Okay alles klar! Ich habe deinen Termin jetzt aufgenommen, sind die Angaben korrekt?\n\n- Name: *${name}*\n- Datum: *${date}*\n- Startzeit: *${start_time}*\n- Dauer: *45 Minuten*`;

  return replyMessage;
}

async function tryCloseSession(session) {
  try {
    await createEvent(session.entities);
    await manager.deleteSession(session.userId);
    return "Alles klar! Termin wurde gebucht!";
  } catch (err) {
    console.error(err);
    await manager.deleteSession(session.userId);
    return "Es ist leider ein Fehler aufgetreten probiere es erneut!";
  }
}
