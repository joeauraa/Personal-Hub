export type Mission = {
  id: string;
  title: string;
  recurring: boolean;
  /** When recurring is false */
  completed: boolean;
  /** When recurring is true — YYYY-MM-DD of last completion in local time */
  lastCompletedDay: string | null;
};
