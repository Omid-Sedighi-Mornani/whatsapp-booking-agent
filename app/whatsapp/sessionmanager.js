const userSessions = new Map();

export class Session {
  constructor(userId) {
    this.entities = {};
    this.messages = [];
    this.userId = userId;
    this.timeOut = null;
    this.confirmed = false;
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
    this.setSessionTimeOut(session, 10);
  }

  static async deleteSession(userId) {
    userSessions.delete(userId);
  }

  static async setSessionTimeOut(session, minutes) {
    if (session.timeOut) {
      clearTimeout(session.timeOut);
    }

    session.timeOut = setTimeout(() => {
      console.log(`Session für ${session.userId} abgelaufen!`);
      this.deleteSession(session.userId);
    }, minutes * 60 * 1000);
  }
}
