import { useMemo } from "react";
import dayjs from "dayjs";
import type { Book, ReadingLog } from "../types";

export function generateMonthCalendar(year: number, monthIndex: number): (string | null)[] {
  const firstDay = dayjs(new Date(year, monthIndex, 1));
  const startDayOfWeek = firstDay.day(); // 0..6 (Sun..Sat)
  const totalDaysInMonth = firstDay.daysInMonth();

  const calendar: (string | null)[] = [];
  
  // Add padding for days before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    calendar.push(null);
  }

  // Add actual days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    calendar.push(dayjs(new Date(year, monthIndex, day)).format("YYYY-MM-DD"));
  }
  
  return calendar;
}

export function useMonthlyLogs(logs: ReadingLog[], books: Book[]) {
  const bookMap = useMemo(
    () => new Map(books.map((book) => [book.id, book])),
    [books]
  );

  const logsByDate = useMemo(() => {
    const dateMap = new Map<string, string[]>();
    
    for (const log of logs) {
      const existingBookIds = dateMap.get(log.date) || [];
      if (!existingBookIds.includes(log.bookId)) {
        existingBookIds.push(log.bookId);
      }
      dateMap.set(log.date, existingBookIds);
    }
    
    return dateMap;
  }, [logs]);

  function getBooksForDate(date: string): Book[] {
    const bookIds = logsByDate.get(date) || [];
    return bookIds.map((id) => bookMap.get(id)).filter(Boolean) as Book[];
  }

  return { bookMap, logsByDate, getBooksForDate };
}
