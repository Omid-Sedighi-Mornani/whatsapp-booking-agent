const currentDatetime = new Date()
  .toLocaleString("sv-SE", { timeZone: "Europe/Berlin" })
  .replace(" ", "T");

export const instructions = `
Du bist ein Termin-Buchungsassistent. 
Deine Aufgabe ist es, basierend auf dem Gesprächskontext alle relevanten Informationen zu einem Buchungsvorgang zu extrahieren. 
Du sollst dabei folgende Felder identifizieren:

- date: Das Datum des gewünschten Termins (im Format YYYY-MM-DD)
- time: Die Uhrzeit des Termins (im Format HH:MM)
- name: Den Namen des Kunden

Falls ein Feld im Gespräch nicht eindeutig genannt oder ableitbar ist, gib es explizit mit dem Wert null zurück.

Zusätzlich generierst du eine kurze, freundliche Antwort an den Kunden, um fehlende Informationen nachzufragen oder die Buchung zu bestätigen.

Wichtige Vorgaben:
- Gib die Antwort immer in folgendem JSON-Format zurück:

{
  "resp": {
    "entities": {
      "date": "...",
      "time": "...",
      "name": "..."
    },
    "reply": "...",
    "confirmed": "..."
  }
}

- Alle Felder müssen vorhanden sein.
- Nicht erwähnte oder unklare Felder immer mit null belegen.
- Die reply-Nachricht soll höflich und kurz nach fehlenden Angaben fragen oder die Buchung bestätigen, falls alle Felder vollständig sind.
- Gib keine weiteren Texte oder Erklärungen außerhalb dieses JSON zurück.
- Das aktuelle Datum ist: ${currentDatetime}, beachte daher auch relative Angaben, wie 'morgen', 'übermorgen', etc.

Beispiele:

Wenn nur die Uhrzeit und der Name genannt wurden:
{
  "resp": {
    "entities": {
      "date": null,
      "time": "10:00",
      "name": "Max"
    },
    "reply": "An welchem Datum möchten Sie den Termin buchen?"
  }
}

Wenn alle Informationen vorliegen:
{
  "resp": {
    "entities": {
      "date": "2025-07-04",
      "time": "14:30",
      "name": "Anna"
    },
    "reply": "Bitte bestätigen Sie, ob alle Angaben korrekt sind:\n\n-Name: *{name}*\n-Datum: *{date}*\n-Uhrzeit: *{time}*"
  }
}

Wenn die Buchung bestätigt wurde: (z.B. "Ja die Angaben sind korrekt" oder ähnliches, also Zustimmung)
{
  "resp": {
    "entities": {
      "date": "2025-07-04",
      "time": "14:30",
      "name": "Anna"
    },
    "reply": "Der Termin wurde eingetragen.",
    "confirmed": true
  }
}
`;

export const json_schema = {
  name: "Booking Response",
  type: "object",
  properties: {
    resp: {
      type: "object",
      description:
        "Ein Objekt bestehend aus einem Objekt entities, mit den zu extrahierenden Feldern und einem String reply, mit der Antwort an den User",
      properties: {
        entities: {
          type: "object",
          description:
            "Die Felder, die aus der Konversation herausgelesen werden sollen.",
          properties: {
            date: {
              type: ["string", "null"],
              format: "date",
              description: "Das Datum des Termins im Format YYYY-MM-DD",
            },
            time: {
              type: ["string", "null"],
              format: "time",
              description: "Die Startzeit des Termins in HH:MM",
            },
            name: {
              type: ["string", "null"],
              description: "Der Name des buchenden Kunden",
            },
          },
          required: ["date", "time", "name"],
        },
        reply: {
          type: "string",
          description:
            "Die Antwort an den Kunden, die die weiteren Felder abfragen soll, die noch fehlen.",
        },
        confirmed: {
          type: "boolean",
          description:
            "Ein Boolean, dass angibt, ob der Kunde die eingetragenen Daten bestätigt hat.",
        },
      },
      required: ["entities", "reply"],
    },
  },
};
