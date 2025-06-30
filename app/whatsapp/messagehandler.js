import {
  extractFields,
  generateFollowUp,
  checkIfBookingVerified,
} from "../agent/agent.js";
import { createEvent } from "../calendar/booking.js";

const userSessions = new Map();

export async function handleMessage(userId, message) {
  let session = userSessions.get(userId);
  if (!session) {
    session = { entities: {}, messages: [], bookingVerified: false };
  }
  session.messages.push({ role: "user", content: message });

  const extractedFields = await extractFields(
    session.messages,
    session.entities
  );

  session.entities = { ...session.entities, ...extractedFields };
  const missingFields = await checkMissingFields(session.entities);

  let replyMessage = null;

  if (missingFields.length === 0) {
    session.bookingVerified = await checkIfBookingVerified(session.messages);
    if (!session.bookingVerified) {
      const { name, date, start_time, end_time } = session.entities;
      replyMessage = `Okay alles klar! Ich habe deinen Termin jetzt aufgenommen, sind die Angaben korrekt?\n\n- Name: *${name}*\n- Datum: *${date}*\n- Startzeit: *${start_time}*\n- Endzeit: *${end_time}*`;
    } else {
      replyMessage = "Alles klar! Dein Termin ist jetzt gebucht!";
      await createEvent(session.entities);
      userSessions.delete(userId);
    }
  } else {
    replyMessage = await generateFollowUp(session.messages, missingFields);
    session.messages.push({ role: "user", content: replyMessage });
    userSessions.set(userId, session);
  }

  console.log("User-ID:", userId);
  console.log("User-Session", session);
  console.log("-----------");

  return replyMessage;
}

async function checkMissingFields(entities) {
  const required = ["name", "date", "start_time", "end_time"];

  return required.filter((field) => !entities[field]);
}
