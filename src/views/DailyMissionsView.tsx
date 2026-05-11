import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { usePersistedState } from "../hooks/usePersistedState";
import { toLocalISODate } from "../lib/dates";
import { newId } from "../lib/id";
import type { Mission } from "../types/hubMission";
import { storageKey } from "../utils/storage";

const MISSIONS_KEY = storageKey("missions.list");

export function DailyMissionsView() {
  const [missions, setMissions] = usePersistedState<Mission[]>(MISSIONS_KEY, []);
  const [draft, setDraft] = useState("");
  const [recurringDraft, setRecurringDraft] = useState(false);

  const today = toLocalISODate(new Date());

  function addMission() {
    const title = draft.trim();
    if (!title) return;

    const next: Mission = {
      id: newId(),
      title,
      recurring: recurringDraft,
      completed: false,
      lastCompletedDay: null,
    };
    setMissions((prev) => [next, ...prev]);
    setDraft("");
    setRecurringDraft(false);
  }

  function toggleMission(m: Mission) {
    setMissions((prev) =>
      prev.map((row) => {
        if (row.id !== m.id) return row;
        if (!row.recurring) {
          return { ...row, completed: !row.completed };
        }
        const completedToday = row.lastCompletedDay === today;
        return {
          ...row,
          lastCompletedDay: completedToday ? null : today,
        };
      }),
    );
  }

  function removeMission(id: string) {
    setMissions((prev) => prev.filter((x) => x.id !== id));
  }

  function checked(m: Mission): boolean {
    if (!m.recurring) return m.completed;
    return m.lastCompletedDay === today;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Daily missions</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Use the inputs and real buttons below. Recurring missions only track today—tomorrow starts fresh.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              New mission
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMission();
                }
              }}
              placeholder="What needs to ship today?"
              className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/35"
              autoComplete="off"
              enterKeyHint="done"
            />
          </label>
          <button
            type="button"
            onClick={addMission}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-[0.99]"
          >
            <Plus className="size-4" aria-hidden />
            Add
          </button>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={recurringDraft}
            onChange={(e) => setRecurringDraft(e.target.checked)}
            className="size-4 rounded border-zinc-300 bg-white text-emerald-600 outline-none ring-emerald-500/30 ring-offset-white focus-visible:ring-2"
          />
          <span>Daily repeating (resets on the next calendar day)</span>
        </label>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-800">
          Active list <span className="font-normal text-zinc-500">({missions.length})</span>
        </h3>

        <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white shadow-sm">
          {missions.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-zinc-500">
              Nothing yet — fill the field above and press{" "}
              <strong className="text-zinc-800">Add</strong>.
            </li>
          ) : (
            missions.map((m) => (
              <li key={m.id} className="flex items-start gap-3 px-3 py-3 sm:gap-4 sm:px-4">
                <input
                  type="checkbox"
                  checked={checked(m)}
                  onChange={() => toggleMission(m)}
                  className="mt-1 size-5 shrink-0 rounded border-zinc-300 bg-white text-emerald-600 outline-none ring-emerald-500/30 ring-offset-white focus-visible:ring-2"
                  aria-label={`Mark ${m.title} complete`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      "text-[15px] font-medium leading-snug",
                      checked(m) ? "text-zinc-400 line-through" : "text-zinc-900",
                    ].join(" ")}
                  >
                    {m.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {m.recurring ? "Repeating · checkbox follows today's progress" : "One-off"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeMission(m.id)}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${m.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
