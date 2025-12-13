import React, { useMemo, useState } from "react";
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
      <div className="card">
        <h2 className="sectionTitle">Daily</h2>
        <p className="hint" style={{ marginBottom: 10 }}>
          Heatmap shows last 365 days. Click a square to see that day.
        </p>

        <Heatmap days={last365Days} onDateClick={setSelectedDate} />

        <p className="hint" style={{ marginTop: 8 }}>
          Tip: pages/minutes are optional, logging *anything* makes the day show up.
        </p>
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
