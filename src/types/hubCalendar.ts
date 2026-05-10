export type HubCalendarEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  /** ISO datetime string for reminder, or null */
  reminderAt: string | null;
};
