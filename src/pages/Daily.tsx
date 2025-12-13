import { useMemo, useState } from "react";
import dayjs from "dayjs";
import type { Book, ReadingLog } from "../types";
import Heatmap from "../components/Heatmap.tsx";
import LogForm from "../components/LogForm.tsx";
import LogsList from "../components/LogsList.tsx";
import { useDailyLogs, getLogsForDate } from "../hooks/useDailyLogs";

type Props = {
  books: Book[];
  logs: ReadingLog[];
};

export default function Daily({ books, logs }: Props) {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  
  const { last365Days } = useDailyLogs(logs);
  const bookMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const selectedLogs = useMemo(
    () => getLogsForDate(logs, selectedDate),
    [logs, selectedDate]
  );

  return (
    <div className="dailyPage">
      <div className="dailyLeftColumn">
        <div className="card">
          <h2 className="sectionTitle">365 Days</h2>
          <p className="hint" style={{ marginBottom: 10 }}>
            Click a square to see logs for that day.
          </p>

          <Heatmap days={last365Days} onDateClick={setSelectedDate} />
        </div>
      </div>

      <div className="dailyRightColumn">
        <LogForm
          books={books}
          selectedDate={selectedDate}
          formattedDate={dayjs(selectedDate).format("MMM D, YYYY")}
        />

        <div className="card">
          <h3 className="sectionTitle">Logs</h3>
          <LogsList logs={selectedLogs} bookMap={bookMap} />
        </div>
      </div>
    </div>
  );
}
