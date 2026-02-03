import type { calendar_v3 } from "googleapis";
import ical from "ical-generator";
import type { CalendarEvent } from "./calendar.ts";

type EventDateTime = calendar_v3.Schema$EventDateTime;

interface ParsedTime {
  date: Date;
  allDay: boolean;
  timezone: string | undefined;
}

function parseEventTime(dt: EventDateTime | undefined): ParsedTime | null {
  if (!dt) {
    return null;
  }

  if (dt.dateTime) {
    return {
      date: new Date(dt.dateTime),
      allDay: false,
      timezone: dt.timeZone ?? undefined,
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
