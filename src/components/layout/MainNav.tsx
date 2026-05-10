import { CalendarDays, ListTodo, Wallet } from "lucide-react";

import type { HubTabId } from "../../types/navigation";

const tabs: { id: HubTabId; label: string; shortLabel: string; icon: typeof CalendarDays }[] = [
  { id: "calendar", label: "Calendar & Events", shortLabel: "Calendar", icon: CalendarDays },
  { id: "missions", label: "Daily Missions", shortLabel: "Missions", icon: ListTodo },
  { id: "finance", label: "Finance & Wallet", shortLabel: "Finance", icon: Wallet },
];

type MainNavProps = {
  active: HubTabId;
  onSelect: (id: HubTabId) => void;
};

export function MainNav({ active, onSelect }: MainNavProps) {
  return (
    <>
      {/* Desktop / tablet — top segmented control */}
      <nav
        className="hidden sm:flex rounded-xl bg-zinc-900/70 p-1 ring-1 ring-zinc-800/80 backdrop-blur-sm md:rounded-2xl"
        aria-label="Primary"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/35"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100",
              ].join(" ")}
            >
              <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile — bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800/90 bg-zinc-950/90 px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur-md sm:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-lg items-stretch gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex min-h-[3rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[11px] font-medium transition-colors",
                  isActive ? "text-emerald-400" : "text-zinc-500",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex size-9 items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-400",
                  ].join(" ")}
                  aria-hidden
                >
                  <Icon className="size-[1.125rem]" />
                </span>
                <span className="max-w-[4.25rem] truncate">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
