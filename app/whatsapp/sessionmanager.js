const userSessions = new Map();

export class Session {
  constructor(userId) {
    this.entities = {};
    this.messages = [];
    this.userId = userId;
  }

  addMessage(role, content) {
    this.messages.push({ role, content });
  }
}

export class SessionManager {
  /**
   * @param {string} userId
   * @returns {Session}
   */
  static async getSession(userId) {
    let session = userSessions.get(userId);
    if (!session) {
      session = new Session(userId);
      userSessions.set(userId, session);
    }
    return session;
  }

  static async saveSession(userId, session) {
    userSessions.set(userId, session);
  }

  static async deleteSession(userId) {
    userSessions.delete(userId);
  }
}
