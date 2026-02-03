import process from "node:process";

const DEFAULT_PORT = 3000;

interface Config {
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  googleCalendarId: string;
  feedToken: string;
  port: number;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadConfig(): Config {
  return {
    googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
    googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    googleRefreshToken: requireEnv("GOOGLE_REFRESH_TOKEN"),
    googleCalendarId: requireEnv("GOOGLE_CALENDAR_ID"),
    feedToken: requireEnv("FEED_TOKEN"),
    port: Number.parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10),
  };
}

export { loadConfig };
export type { Config };
