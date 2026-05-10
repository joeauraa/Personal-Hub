import type { ReactNode } from "react";

import type { HubTabId } from "../../types/navigation";
import { MainNav } from "./MainNav";

type AppShellProps = {
  activeTab: HubTabId;
  onTabChange: (id: HubTabId) => void;
  children: ReactNode;
};

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:gap-6 md:px-6 md:py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-500/90">
              Personal Hub
            </p>
            <h1 className="mt-1 truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
              Your day, missions, and money
            </h1>
          </div>
          <MainNav active={activeTab} onSelect={onTabChange} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:py-8 sm:pb-8 md:px-6 lg:pb-12">
        {children}
      </main>
    </div>
  );
}
