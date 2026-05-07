import type { calendar_v3 } from "googleapis";
import ical from "ical-generator";
import type { CalendarEvent } from "./calendar.ts";

type EventDateTime = calendar_v3.Schema$EventDateTime;

interface ParsedTime {
  date: Date;
  allDay: boolean;
  timezone: string | undefined;
}

// ical-generator with a `timezone:` option does not convert absolute time
// to that zone — it reads the Date's system-local wall clock and labels it
// with TZID. Pre-shift the Date so its system-local wall clock matches the
// real wall clock in the target zone.
function shiftToTimezoneWallClock(date: Date, timezone: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return new Date(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
}

function parseEventTime(dt: EventDateTime | undefined): ParsedTime | null {
  if (!dt) {
    return null;
  }

  if (dt.dateTime) {
    const absolute = new Date(dt.dateTime);
    const timezone = dt.timeZone ?? undefined;
    return {
      date: timezone ? shiftToTimezoneWallClock(absolute, timezone) : absolute,
      allDay: false,
      timezone,
    };
  }

  if (dt.date) {
    return {
      date: new Date(`${dt.date}T00:00:00`),
      allDay: true,
      timezone: dt.timeZone ?? undefined,
    };
  }

  return null;
}

function generateFeed(events: CalendarEvent[], calendarName: string): string {
  const calendar = ical({ name: calendarName });

  for (const event of events) {
    const start = parseEventTime(event.start);
    if (!start) {
      continue;
    }

    const end = parseEventTime(event.end);

    const icalEvent = calendar.createEvent({
      id: event.id ?? undefined,
      summary: event.summary ?? undefined,
      description: event.description ?? undefined,
      location: event.location ?? undefined,
      url: event.htmlLink ?? undefined,
      start: start.date,
      allDay: start.allDay,
      timezone: start.timezone,
    });

    if (end) {
      icalEvent.end(end.date);
    }
  }

  return calendar.toString();
}

export { generateFeed };
