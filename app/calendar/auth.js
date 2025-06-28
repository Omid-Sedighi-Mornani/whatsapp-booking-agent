import "dotenv/config";
import fs from "fs";
import readline from "readline";
import { google } from "googleapis";
import process, { stdin, stdout } from "process";
import path from "path";
import open from "open";
import express from "express";

// Redirection server to receive and send the code (at localhost:3000 in the moment)

const waitForCode = () => {
  return new Promise((resolve) => {
    const app = express();
    const server = app.listen(3000);
    app.get("/callback", async (req, res) => {
      const code = req.query.code;
      res.send("Das wars! Du kannst das Fenster nun schließen!");
      resolve(code);
      server.close();
    });
  });
};

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const TOKEN_PATH = path.join(process.cwd(), process.env.TOKEN_PATH);

export async function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const OAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    OAuth2Client.setCredentials(JSON.parse(token));
    return OAuth2Client;
  } else {
    return await getAccessToken(OAuth2Client);
  }
}

async function getAccessToken(OAuth2Client) {
  const authUrl = OAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Melden Sie sich mit ihrem Google Account an!");
  open(authUrl);
  const code = await waitForCode();
  const { tokens } = await OAuth2Client.getToken(code);
  OAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log(
    "Sie sind erfolgreich authorisiert und der Token wurde erstellt!"
  );

  return OAuth2Client;
}
