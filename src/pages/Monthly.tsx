import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import type { Book, ReadingLog } from "../types";

type Props = {
  books: Book[];
  logs: ReadingLog[];
};

function monthDays(year: number, monthIndex0: number) {
  const first = dayjs(new Date(year, monthIndex0, 1));
  const startDow = first.day(); // 0..6 (Sun..Sat)
  const daysInMonth = first.daysInMonth();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(dayjs(new Date(year, monthIndex0, d)).format("YYYY-MM-DD"));
  }
  return cells;
}

export default function Monthly({ books, logs }: Props) {
  const [cursor, setCursor] = useState(dayjs()); // current displayed month

  const bookMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);

  const byDate = useMemo(() => {
    // map date -> unique bookIds logged that day (preserve insertion)
    const map = new Map<string, string[]>();
    for (const l of logs) {
      const arr = map.get(l.date) || [];
      if (!arr.includes(l.bookId)) arr.push(l.bookId);
      map.set(l.date, arr);
    }
    return map;
  }, [logs]);

  const year = cursor.year();
  const month = cursor.month(); // 0-11
  const cells = useMemo(() => monthDays(year, month), [year, month]);

  const title = cursor.format("MMMM YYYY");

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dayBooks = useMemo(() => {
    if (!selectedDate) return [];
    const ids = byDate.get(selectedDate) || [];
    return ids.map((id) => bookMap.get(id)).filter(Boolean) as Book[];
  }, [selectedDate, byDate, bookMap]);

  return (
    <div className="split">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <h2 className="sectionTitle">{title}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button" onClick={() => setCursor(cursor.subtract(1, "month"))}>←</button>
            <button className="button" onClick={() => setCursor(dayjs())}>Today</button>
            <button className="button" onClick={() => setCursor(cursor.add(1, "month"))}>→</button>
          </div>
        </div>

        <div className="hint">Days show covers for books you logged reading that day.</div>

        <div className="monthGrid" role="grid" aria-label="Monthly calendar">
          {cells.map((date, idx) => {
            if (!date) return <div key={`pad-${idx}`} style={{ opacity: 0.0 }} className="day" />;

            const ids = byDate.get(date) || [];
            const covers = ids
              .map((id) => bookMap.get(id)?.coverUrl)
              .filter(Boolean)
              .slice(0, 3) as string[];

            return (
              <div
                key={date}
                className="day"
                onClick={() => setSelectedDate(date)}
                role="button"
                tabIndex={0}
                title={date}
              >
                <div className="dayNum">{dayjs(date).date()}</div>
                <div className="dayCovers">
                  {covers.map((c, i) => (
                    <img key={`${date}-${i}`} className="dayCover" src={c} alt="" />
                  ))}
                  {ids.length > 3 ? <span className="small">+{ids.length - 3}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="sectionTitle">
          {selectedDate ? dayjs(selectedDate).format("MMM D, YYYY") : "Pick a day"}
        </h2>

        {!selectedDate ? (
          <p className="small">Click a day to see what you read.</p>
        ) : dayBooks.length === 0 ? (
          <p className="small">No reading logs on this day.</p>
        ) : (
          <ul className="list">
            {dayBooks.map((b) => (
              <li key={b.id} className="li">
                <img className="cover" src={b.coverUrl || ""} alt="" />
                <div>
                  <div className="resultTitle">{b.title}</div>
                  <div className="muted">{b.authors.join(", ")}</div>
                  <div className="pills">
                    {b.genres.slice(0, 3).map((g) => <span key={g} className="pill">{g}</span>)}
                    {b.tags.slice(0, 3).map((t) => <span key={t} className="pill">{t}</span>)}
                  </div>
                </div>
                <span className="pill">{b.status.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="hint" style={{ marginTop: 10 }}>
          Monthly covers are powered by your Daily logs (not status dates yet).
        </div>
      </div>
    </div>
  );
}
