
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, addDays, addWeeks, addMonths } from 'date-fns';
import { PeriodType } from '../types';

export const getPeriodKey = (date: Date, type: PeriodType): string => {
  switch (type) {
    case 'daily':
      return format(date, 'yyyy-MM-dd');
    case 'weekly':
      const monday = startOfWeek(date, { weekStartsOn: 1 });
      return format(monday, 'yyyy-\'W\'II'); 
    case 'monthly':
      return format(date, 'yyyy-MM');
  }
};

export const getPeriodBounds = (date: Date, type: PeriodType) => {
  switch (type) {
    case 'daily':
      return { start: date, end: date };
    case 'weekly':
      return { 
        start: startOfWeek(date, { weekStartsOn: 1 }), 
        end: endOfWeek(date, { weekStartsOn: 1 }) 
      };
    case 'monthly':
      return { 
        start: startOfMonth(date), 
        end: endOfMonth(date) 
      };
  }
};

export const getNextPeriodDate = (date: Date, type: PeriodType, amount = 1) => {
  switch (type) {
    case 'daily': return addDays(date, amount);
    case 'weekly': return addWeeks(date, amount);
    case 'monthly': return addMonths(date, amount);
  }
};

export const isTaskValidForPeriod = (taskCreatedAt: number, periodStart: Date, periodEnd: Date, taskDeletedAt?: number): boolean => {
  const createdAt = new Date(taskCreatedAt);
  
  // Rule: New tasks only apply from "today" forward (no backfilling).
  // Task is valid if it was created before or during this period.
  const isCreatedBeforeEnd = createdAt <= periodEnd;
  
  // Rule: Deletion applies from current period forward (past periods remain unchanged).
  // Task is valid if it hasn't been deleted yet, or was deleted AFTER this period started.
  const isNotDeletedYet = !taskDeletedAt || new Date(taskDeletedAt) > periodStart;

  return isCreatedBeforeEnd && isNotDeletedYet;
};
