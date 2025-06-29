import { extractFields, generateFollowUp } from "../agent/agent.js";
import { createEvent } from "../calendar/booking.js";

const userSessions = new Map();

export async function handleMessage(userId, message) {
  let session = userSessions.get(userId);
  if (!session) {
    session = { entities: {} };
  }

  const extractedFields = await extractFields(message);

  session.entities = { ...session.entities, ...extractedFields };

  const missingFields = await checkMissingFields(session.entities);

  let replyMessage = null;

  if (missingFields.length === 0) {
    // Compose summary message with all entities
    const { name, date, start_time, end_time } = session.entities;
    replyMessage = `Super! Ich habe deinen Termin am ${date} von ${start_time} bis ${end_time} für ${name} eingetragen.`;
    await createEvent(session.entities);
    userSessions.delete(userId);
  } else {
    replyMessage = await generateFollowUp(missingFields);
    userSessions.set(userId, session);
  }

  console.log("User-ID:", userId);
  console.log("User-Session", session);

  return replyMessage;
}

async function checkMissingFields(entities) {
  const required = ["name", "date", "start_time", "end_time"];

  return required.filter((field) => !entities[field]);
}
