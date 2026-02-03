import http from "node:http";
import process from "node:process";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const CALLBACK_PORT = 3000;
const REDIRECT_URI = `http://localhost:${String(CALLBACK_PORT)}/callback`;

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const clientId = getEnvOrThrow("GOOGLE_CLIENT_ID");
const clientSecret = getEnvOrThrow("GOOGLE_CLIENT_SECRET");

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  REDIRECT_URI,
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("Visit this URL to authorise the application:\n");
console.log(authUrl);
console.log(
  `\nWaiting for callback on http://localhost:${String(CALLBACK_PORT)}/callback ...\n`,
);

const server = http.createServer((req, res) => {
  const url = new URL(
    req.url ?? "/",
    `http://localhost:${String(CALLBACK_PORT)}`,
  );

  if (url.pathname !== "/callback") {
    res.writeHead(HTTP_NOT_FOUND);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(HTTP_BAD_REQUEST);
    res.end("Missing code parameter");
    return;
  }

  void oauth2Client.getToken(code).then(({ tokens }) => {
    res.writeHead(HTTP_OK, { "Content-Type": "text/plain" });
    res.end("Authorisation complete — you can close this tab.");

    console.log("Refresh token:\n");
    console.log(tokens.refresh_token);
    console.log(
      "\nSet this as GOOGLE_REFRESH_TOKEN in your environment variables.",
    );

    server.close();
  });
});

server.listen(CALLBACK_PORT);
