import { useMemo, useState } from "react";
import dayjs from "dayjs";
import type { Book, ReadingLog } from "../types";
import CalendarGrid from "../components/CalendarGrid.tsx";
import LogForm from "../components/LogForm.tsx";
import LogsList from "../components/LogsList.tsx";
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

  const selectedLogs = useMemo(
    () => selectedDate ? logs.filter((log) => log.date === selectedDate).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : [],
    [logs, selectedDate]
  );

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
      <div className="monthlyLeftColumn">
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
      </div>

      <div className="monthlyRightColumn">
        {selectedDate && (
          <LogForm
            books={books}
            selectedDate={selectedDate}
            formattedDate={dayjs(selectedDate).format("MMM D, YYYY")}
          />
        )}

        <div className="card">
          <h2 className="sectionTitle">
            {selectedDate ? `Logs for ${dayjs(selectedDate).format("MMM D, YYYY")}` : "Pick a day"}
          </h2>

          {!selectedDate ? (
            <p className="emptyMessage">Click a day to log reading or view logs.</p>
          ) : (
            <LogsList logs={selectedLogs} bookMap={bookMap} />
          )}
        </div>
      </div>
    </div>
  );
}
