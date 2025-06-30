const userSessions = new Map();

export class Session {
  #required = ["name", "date", "start_time", "end_time"];
  constructor() {
    this.entities = {};
    this.messages = [];
    this.bookingVerified = false;
  }

  logToConsole() {
    console.log("--------------------------");
    console.log(`Messages:\n${JSON.stringify(this.messages, null, 2)}\n`);
    console.log(`Entities:\n${JSON.stringify(this.entities, null, 2)}\n`);
    console.log(`Verified:\n${this.bookingVerified}\n`);
  }

  addMessage(role, content) {
    this.messages.push({ role, content });
  }

  isComplete() {
    return this.#required.every((field) => this.entities[field]);
  }

  isVerified() {
    return this.bookingVerified;
  }

  addEntities(newEntities) {
    this.entities = { ...this.entities, ...newEntities };
  }

  getMissingEntities() {
    return this.#required.filter((field) => !this.entities[field]);
  }

  markVerified() {
    this.bookingVerified = true;
  }

  setVerified(verified) {
    this.bookingVerified = verified;
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
