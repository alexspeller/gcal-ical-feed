import type { calendar_v3 } from "googleapis";
import { google } from "googleapis";
import type { createOAuth2Client } from "./auth.ts";

type CalendarEvent = calendar_v3.Schema$Event;

const DAYS_BEFORE = 30;
const DAYS_AHEAD = 365;
const MAX_RESULTS = 10000;

async function fetchEvents(
  auth: ReturnType<typeof createOAuth2Client>,
  calendarId: string,
): Promise<CalendarEvent[]> {
  const cal = google.calendar({ version: "v3", auth });

  const now = new Date();
  const timeMin = new Date(now);
  timeMin.setDate(timeMin.getDate() - DAYS_BEFORE);
  const timeMax = new Date(now);
  timeMax.setDate(timeMax.getDate() + DAYS_AHEAD);

  const response = await cal.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: MAX_RESULTS,
  });

  return response.data.items ?? [];
}

export { fetchEvents };
export type { CalendarEvent };
