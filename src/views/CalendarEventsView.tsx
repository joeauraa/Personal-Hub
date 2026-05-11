import { InteractiveCalendar } from "../components/calendar/InteractiveCalendar";
import { usePersistedState } from "../hooks/usePersistedState";
import { storageKey } from "../utils/storage";
import type { HubCalendarEvent } from "../types/hubCalendar";

const EVENTS_KEY = storageKey("calendar.events");

export function CalendarEventsView() {
  const [events, setEvents] = usePersistedState<HubCalendarEvent[]>(EVENTS_KEY, []);

  return (
    <div className="space-y-1">
      <p className="text-sm text-zinc-600">
        Pick a date, then add titles, descriptions, and optional reminders. Everything stays on this device
        via local storage.
      </p>
      <div className="mt-6">
        <InteractiveCalendar events={events} onEventsChange={setEvents} />
      </div>
    </div>
  );
}
