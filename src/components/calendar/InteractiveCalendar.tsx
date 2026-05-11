import { AlarmClock, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import type { HubCalendarEvent } from "../../types/hubCalendar";
import {
  addMonths,
  endOfMonth,
  formatMonthYear,
  startOfMonth,
  toLocalISODate,
  weekdaysShort,
} from "../../lib/dates";
import { newId } from "../../lib/id";

type InteractiveCalendarProps = {
  events: HubCalendarEvent[];
  onEventsChange: Dispatch<SetStateAction<HubCalendarEvent[]>>;
};

export function InteractiveCalendar({ events, onEventsChange }: InteractiveCalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(() => toLocalISODate(new Date()));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderAt, setReminderAt] = useState("");

  const calendarCells = useMemo(() => {
    const start = startOfMonth(monthCursor);
    const end = endOfMonth(monthCursor);
    const pad = start.getDay();
    const totalDays = end.getDate();
    const cells: ({ kind: "empty" } | { kind: "day"; iso: string; label: number })[] = [];

    for (let i = 0; i < pad; i += 1) cells.push({ kind: "empty" });
    for (let d = 1; d <= totalDays; d += 1) {
      const iso = toLocalISODate(new Date(start.getFullYear(), start.getMonth(), d));
      cells.push({ kind: "day", iso, label: d });
    }
    while (cells.length % 7 !== 0) cells.push({ kind: "empty" });
    return cells;
  }, [monthCursor]);

  const todayIso = toLocalISODate(new Date());
  const eventsForSelectedDate = events.filter((e) => e.date === selectedDate);
  const eventCountForMonth = events.filter((e) => {
    const d = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`;
    return e.date.startsWith(d);
  }).length;

  function persistAddEvent() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const reminderValue =
      reminderAt.trim().length === 0 ? null : new Date(reminderAt).toISOString();
    const next: HubCalendarEvent = {
      id: newId(),
      date: selectedDate,
      title: trimmedTitle,
      description: description.trim(),
      reminderAt:
        reminderValue && !Number.isNaN(Date.parse(reminderValue)) ? reminderValue : null,
    };

    onEventsChange((prev) => [next, ...prev]);
    setTitle("");
    setDescription("");
    setReminderAt("");
  }

  function deleteEvent(id: string) {
    onEventsChange((prev) => prev.filter((e) => e.id !== id));
  }

  function formatReminderBadge(iso: string | null) {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Calendar</h2>
            <p className="text-sm text-zinc-600">
              {events.length} saved event{events.length === 1 ? "" : "s"} ·{" "}
              <span title="Events dated in this month">{eventCountForMonth}</span> this month
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white p-1 ring-1 ring-zinc-200 shadow-sm">
            <button
              type="button"
              onClick={() => setMonthCursor(addMonths(monthCursor, -1))}
              className="inline-flex size-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="min-w-[10.5rem] text-center text-sm font-medium text-zinc-900">
              {formatMonthYear(monthCursor)}
            </span>
            <button
              type="button"
              onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
              className="inline-flex size-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Next month"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekdaysShort().map((w) => (
            <div
              key={w}
              className="pb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
            >
              {w}
            </div>
          ))}
          {calendarCells.map((cell, idx) => {
            if (cell.kind === "empty") {
              return <div key={`e-${idx}`} className="min-h-[2.65rem]" />;
            }

            const { iso, label } = cell;
            const count = events.filter((e) => e.date === iso).length;
            const isToday = iso === todayIso;
            const isSel = iso === selectedDate;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDate(iso)}
                aria-pressed={isSel}
                className={[
                  "relative min-h-[2.65rem] rounded-lg px-2 py-1.5 text-left text-sm font-medium transition-colors sm:min-h-[3rem]",
                  isSel
                    ? "bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400"
                    : "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 shadow-sm",
                  isToday && !isSel ? "shadow-[inset_0_0_0_1.5px_rgba(16,185,129,0.65)]" : "",
                ].join(" ")}
              >
                <span className={isToday ? "font-semibold text-emerald-700" : ""}>{label}</span>
                {count > 0 ? (
                  <span
                    className="absolute bottom-1 right-1 inline-flex size-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm"
                    aria-hidden
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-zinc-200 shadow-sm sm:p-5">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">Selected day</h3>
          <p className="text-sm text-zinc-600">
            {selectedDate === todayIso ? "Today" : new Date(selectedDate + "T12:00:00").toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <fieldset className="space-y-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Add event
          </legend>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Team sync"
              className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none shadow-sm ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/35"
              autoComplete="off"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Notes, agenda, links…"
              className="block w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none shadow-sm ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/35"
            />
          </label>
          <label className="block space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
              <AlarmClock className="size-3.5 text-emerald-600" aria-hidden />
              Reminder (optional)
            </span>
            <input
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
              className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none shadow-sm ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/35"
            />
          </label>
          <button
            type="button"
            onClick={persistAddEvent}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.99]"
          >
            <Plus className="size-4" aria-hidden />
            Add event
          </button>
        </fieldset>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-zinc-800">
            Events on this day ({eventsForSelectedDate.length})
          </h4>
          {eventsForSelectedDate.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-500">
              No events yet — add one with the form above.
            </p>
          ) : (
            <ul className="space-y-2">
              {eventsForSelectedDate.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900">{ev.title}</p>
                      {ev.description ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600">
                          {ev.description}
                        </p>
                      ) : null}
                      {ev.reminderAt ? (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
                          <AlarmClock className="size-3.5" aria-hidden />
                          {formatReminderBadge(ev.reminderAt)}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteEvent(ev.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete event ${ev.title}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
