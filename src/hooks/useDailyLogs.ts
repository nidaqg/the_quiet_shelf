import { useMemo } from "react";
import dayjs from "dayjs";
import type { ReadingLog } from "../types";

type DayData = {
  date: string;
  total: number;
  count: number;
};

export function useDailyLogs(logs: ReadingLog[]) {
  const logsByDate = useMemo(() => {
    const map = new Map<string, DayData>();
    
    for (const log of logs) {
      const existing = map.get(log.date) || { date: log.date, total: 0, count: 0 };
      // Heuristic: 1 page = 1 point, 2 minutes = 1 point
      const points = (log.pages ?? 0) + Math.round((log.minutes ?? 0) / 2);
      
      existing.total += points;
      existing.count += 1;
      map.set(log.date, existing);
    }
    
    return map;
  }, [logs]);

  const last365Days = useMemo(() => {
    const start = dayjs().subtract(364, "day");
    const days: DayData[] = [];
    
    for (let i = 0; i < 365; i++) {
      const date = start.add(i, "day").format("YYYY-MM-DD");
      const dayData = logsByDate.get(date);
      days.push(dayData || { date, total: 0, count: 0 });
    }
    
    return days;
  }, [logsByDate]);

  return { logsByDate, last365Days };
}

export function getLogsForDate(logs: ReadingLog[], date: string): ReadingLog[] {
  return logs
    .filter((log) => log.date === date)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
