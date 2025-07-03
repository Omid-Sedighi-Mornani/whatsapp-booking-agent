const userSessions = new Map();

export class Session {
  constructor(userId) {
    this.entities = {};
    this.messages = [];
    this.confirmed = false;
    this.userId = userId;
  }

  addMessage(role, content) {
    this.messages.push({ role, content });
  }
}

/**
 * @param {string} userId
 * @returns {Session}
 */
export async function getSession(userId) {
  let session = userSessions.get(userId);
  if (!session) {
    session = new Session(userId);
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
