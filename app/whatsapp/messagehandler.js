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

  const bookingConfirmed = await checkIfBookingConfirmed(session.messages);
  session.setConfirmed(bookingConfirmed);

  if (!session.isConfirmed()) {
    replyMessage = await generateConfirmationMessage(session.entities);
    session.logToConsole();
    return replyMessage;
  }

  replyMessage =
    "Alles klar! Dein Termin ist jetzt gebucht!\nWenn du möchtest kannst du weitere Termine buchen!";

  try {
    await createEvent(session.entities);
  } catch (err) {
    replyMessage =
      "Es ist leider ein Fehler aufgetreten! Versuche es bitte noch einmal!";
  }
  session.logToConsole();
  deleteSession(userId);
  return replyMessage;
}

async function generateConfirmationMessage(entities) {
  const { name, date, start_time, end_time } = entities;
  const replyMessage = `Okay alles klar! Ich habe deinen Termin jetzt aufgenommen, sind die Angaben korrekt?\n\n- Name: *${name}*\n- Datum: *${date}*\n- Startzeit: *${start_time}*\n- Endzeit: *${end_time}*`;

  return replyMessage;
}
