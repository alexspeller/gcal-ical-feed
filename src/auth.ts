import { google } from "googleapis";
import type { Config } from "./config.ts";

function createOAuth2Client(config: Config) {
  const client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
  );
  client.setCredentials({ refresh_token: config.googleRefreshToken });
  return client;
}

export { createOAuth2Client };
