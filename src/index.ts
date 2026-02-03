import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createOAuth2Client } from "./auth.ts";
import { fetchEvents } from "./calendar.ts";
import { loadConfig } from "./config.ts";
import { generateFeed } from "./feed.ts";

const config = loadConfig();
const auth = createOAuth2Client(config);

const app = new Hono();

app.get("/health", (c) => {
  return c.text("ok");
});

app.get("/feed", async (c) => {
  const token =
    c.req.query("token") ??
    c.req.header("Authorization")?.replace("Bearer ", "");

  if (token !== config.feedToken) {
    return c.text("Unauthorized", { status: 401 });
  }

  const events = await fetchEvents(auth, config.googleCalendarId);
  const ical = generateFeed(events, "Google Calendar Feed");

  return new Response(ical, {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
});

app.onError((err, c) => {
  console.error(err);
  return c.text("Internal Server Error", { status: 500 });
});

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});
