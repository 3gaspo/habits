
export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface OneOffTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskTemplate {
  id: string;
  title: string;
  period: PeriodType;
  createdAt: number; // Timestamp
  deletedAt?: number; // Optional deletion timestamp
  active: boolean;
}

export interface PeriodSnapshot {
  periodKey: string; // e.g. "2023-10-25" or "2023-W43" or "2023-10"
  periodType: PeriodType;
  dueTaskIds: string[]; // Recurring Task IDs that were due when this period started
  completionMap: Record<string, boolean>; // Map of recurring taskId to completion state
  oneOffTasks: OneOffTask[]; // Non-recurring tasks specific to this snapshot
}

export interface AppState {
  templates: TaskTemplate[];
  snapshots: Record<string, PeriodSnapshot>;
}

export enum ViewMode {
  Home = 'home',
  Calendar = 'calendar',
  Stats = 'stats',
  Settings = 'settings'
}
