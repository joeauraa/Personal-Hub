import { useState } from "react";

import { AppShell } from "./components/layout/AppShell";
import type { HubTabId } from "./types/navigation";
import { CalendarEventsView } from "./views/CalendarEventsView";
import { DailyMissionsView } from "./views/DailyMissionsView";
import { FinanceWalletView } from "./views/FinanceWalletView";

export default function App() {
  const [activeTab, setActiveTab] = useState<HubTabId>("calendar");

  let content = <CalendarEventsView />;
  if (activeTab === "missions") content = <DailyMissionsView />;
  if (activeTab === "finance") content = <FinanceWalletView />;

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      <section aria-label={`${activeTab} section`} className="flex-1">
        {content}
      </section>
    </AppShell>
  );
}
