import {
  extractFields,
  generateFollowUp,
  checkIfBookingConfirmed,
} from "../agent/agent.js";
import { createEvent } from "../calendar/booking.js";
import { deleteSession, getSession, saveSession } from "./sessionmanager.js";

export async function handleMessage(userId, message) {
  const session = await getSession(userId);
  session.addMessage("user", message);

  const confirmed = await checkIfBookingConfirmed(session.messages);
  session.setConfirmed(confirmed);

  if (!(session.isComplete() && session.isConfirmed())) {
    const newEntities = await extractFields(session.messages, session.entities);
    session.addEntities(newEntities);
  }

  if (session.isConfirmed()) {
    return tryCloseSession(session);
  }

  let replyMessage;

  if (session.isComplete()) {
    replyMessage = await generateConfirmationMessage(session.entities);
  } else {
    replyMessage = await generateFollowUp(
      session.messages,
      session.getMissingEntities()
    );
  }

  session.addMessage("assistant", replyMessage);
  saveSession(session.userId, session);

  return replyMessage;
}

async function generateConfirmationMessage(entities) {
  const { name, date, start_time, end_time } = entities;
  const replyMessage = `Okay alles klar! Ich habe deinen Termin jetzt aufgenommen, sind die Angaben korrekt?\n\n- Name: *${name}*\n- Datum: *${date}*\n- Startzeit: *${start_time}*\n- Endzeit: *${end_time}*`;

  return replyMessage;
}

async function tryCloseSession(session) {
  try {
    await createEvent(session.entities);
    deleteSession(session.userId);
    return "Alles klar! Termin wurde gebucht!";
  } catch {
    deleteSession(session.userId);
    return "Es ist leider ein Fehler aufgetreten probiere es erneut!";
  }
}
