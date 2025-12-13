import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import type { Book, ReadingLog } from "../types";
import CalendarGrid from "../components/CalendarGrid.tsx";
import BookList from "../components/BookList.tsx";
import { useMonthlyLogs, generateMonthCalendar } from "../hooks/useMonthlyLogs";

type Props = {
  books: Book[];
  logs: ReadingLog[];
};

const STATUS_LABELS: Record<string, string> = {
  tbr: "TBR",
  reading: "Reading",
  finished: "Finished",
  dnf: "DNF",
};

export default function Monthly({ books, logs }: Props) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { bookMap, logsByDate, getBooksForDate } = useMonthlyLogs(logs, books);

  const calendarDays = useMemo(
    () => generateMonthCalendar(currentMonth.year(), currentMonth.month()),
    [currentMonth]
  );

  const selectedDayBooks = useMemo(() => {
    return selectedDate ? getBooksForDate(selectedDate) : [];
  }, [selectedDate, getBooksForDate]);

  function goToPreviousMonth() {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  }

  function goToCurrentMonth() {
    setCurrentMonth(dayjs());
  }

  function goToNextMonth() {
    setCurrentMonth(currentMonth.add(1, "month"));
  }

  return (
    <div className="monthlyPage">
      <div className="card">
        <div className="monthlyHeader">
          <h2 className="sectionTitle">{currentMonth.format("MMMM YYYY")}</h2>
          <div className="monthlyNav">
            <button className="button" onClick={goToPreviousMonth}>
              ←
            </button>
            <button className="button" onClick={goToCurrentMonth}>
              Today
            </button>
            <button className="button" onClick={goToNextMonth}>
              →
            </button>
          </div>
        </div>

        <p className="hint">Days show covers for books you logged reading that day.</p>

        <CalendarGrid
          calendarDays={calendarDays}
          logsByDate={logsByDate}
          bookMap={bookMap}
          onDateClick={setSelectedDate}
        />
      </div>

      <div className="card">
        <h2 className="sectionTitle">
          {selectedDate ? dayjs(selectedDate).format("MMM D, YYYY") : "Pick a day"}
        </h2>

        {!selectedDate ? (
          <p className="emptyMessage">Click a day to see what you read.</p>
        ) : selectedDayBooks.length === 0 ? (
          <p className="emptyMessage">No reading logs on this day.</p>
        ) : (
          <BookList
            books={selectedDayBooks}
            onCycleStatus={() => {}}
            onRemove={() => {}}
            statusLabels={STATUS_LABELS}
          />
        )}

        <p className="hint" style={{ marginTop: 10 }}>
          Monthly covers are powered by your Daily logs (not status dates yet).
        </p>
      </div>
    </div>
  );
}
