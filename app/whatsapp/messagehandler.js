import * as agent from "../agent/agent.js";
import * as manager from "./sessionmanager.js";
import { createEvent, checkAvailability } from "../calendar/booking.js";

export async function handleMessage(userId, message) {
  const session = await manager.getSession(userId);
  session.addMessage("user", message);
  const response = await agent.generateSessionResponse(session);

  console.log(response);

  const { entities, confirmed, reply: replyMessage } = response.resp;
  session.entities = entities;
  session.addMessage("assistant", replyMessage);

  if (confirmed) {
    await createEvent(session.entities);
    manager.deleteSession(userId);
  }

  manager.saveSession(userId, session);

  return replyMessage;
}
