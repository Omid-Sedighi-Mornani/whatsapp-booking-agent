import {
  extractFields,
  generateFollowUp,
  checkIfBookingVerified,
} from "../agent/agent.js";
import { createEvent } from "../calendar/booking.js";
import { deleteSession, getSession, saveSession } from "./sessionmanager.js";

export async function handleMessage(userId, message) {
  const session = await getSession(userId);

  session.addMessage("user", message);

  const extractedFields = await extractFields(
    session.messages,
    session.entities
  );

  session.addEntities(extractedFields);

  let replyMessage = null;

  if (!session.isComplete()) {
    replyMessage = await generateFollowUp(
      session.messages,
      session.getMissingEntities()
    );

    session.addMessage("assistant", replyMessage);
    session.logToConsole();
    await saveSession(userId, session);
    return replyMessage;
  }

  const bookingVerified = await checkIfBookingVerified(session.messages);
  session.setVerified(bookingVerified);

  if (!session.isVerified()) {
    replyMessage = await generateConfirmationMessage(session.entities);
    session.logToConsole();
    return replyMessage;
  }

  replyMessage = "Alles klar! Dein Termin ist jetzt gebucht!";
  await createEvent(session.entities);
  session.logToConsole();
  deleteSession(userId);
  return replyMessage;
}

async function generateConfirmationMessage(entities) {
  const { name, date, start_time, end_time } = entities;
  const replyMessage = `Okay alles klar! Ich habe deinen Termin jetzt aufgenommen, sind die Angaben korrekt?\n\n- Name: *${name}*\n- Datum: *${date}*\n- Startzeit: *${start_time}*\n- Endzeit: *${end_time}*`;

  return replyMessage;
}
