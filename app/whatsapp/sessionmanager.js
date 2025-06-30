const userSessions = new Map();

export class Session {
  #required = ["name", "date", "start_time", "end_time"];
  constructor() {
    this.entities = {};
    this.messages = [];
    this.bookingConfirmed = false;
  }

  logToConsole() {
    console.log("--------------------------");
    console.log(`Messages:\n${JSON.stringify(this.messages, null, 2)}\n`);
    console.log(`Entities:\n${JSON.stringify(this.entities, null, 2)}\n`);
    console.log(`Confirmed:\n${this.bookingConfirmed}\n`);
  }

  addMessage(role, content) {
    this.messages.push({ role, content });
  }

  isComplete() {
    return this.#required.every((field) => this.entities[field]);
  }

  isConfirmed() {
    return this.bookingConfirmed;
  }

  addEntities(newEntities) {
    this.entities = { ...this.entities, ...newEntities };
  }

  getMissingEntities() {
    return this.#required.filter((field) => !this.entities[field]);
  }

  setConfirmed(confirmed) {
    this.bookingConfirmed = confirmed;
  }
}

/**
 * @param {string} userId
 * @returns {Session}
 */
export async function getSession(userId) {
  let session = userSessions.get(userId);
  if (!session) {
    session = new Session();
    userSessions.set(userId, session);
  }
  return session;
}

export async function saveSession(userId, session) {
  userSessions.set(userId, session);
}

export async function deleteSession(userId) {
  userSessions.delete(userId);
}
