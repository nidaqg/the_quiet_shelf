import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import { db } from "../db";
import type { Book, ReadingLog } from "../types";

type Props = {
  books: Book[];
  logs: ReadingLog[];
};

type DayAgg = {
  date: string;
  total: number; 
  count: number; 
};

function intensityLevel(n: number) {
  if (n <= 0) return "";
  if (n < 10) return "l1";
  if (n < 30) return "l2";
  if (n < 60) return "l3";
  return "l4";
}

export default function Daily({ books, logs }: Props) {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [bookId, setBookId] = useState<string>(books[0]?.id || "");
  const [pages, setPages] = useState<number>(10);
  const [minutes, setMinutes] = useState<number>(0);
  const [note, setNote] = useState("");

  const bookMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);

  const byDate = useMemo(() => {
    const map = new Map<string, DayAgg>();
    for (const l of logs) {
      const prev = map.get(l.date) || { date: l.date, total: 0, count: 0 };
      const amount = (l.pages ?? 0) + Math.round((l.minutes ?? 0) / 2); // tiny heuristic
      prev.total += amount;
      prev.count += 1;
      map.set(l.date, prev);
    }
    return map;
  }, [logs]);

  const heatDays = useMemo(() => {
    // last 365 days including today
    const start = dayjs().subtract(364, "day");
    const days: DayAgg[] = [];
    for (let i = 0; i < 365; i++) {
      const d = start.add(i, "day").format("YYYY-MM-DD");
      const agg = byDate.get(d);
      days.push(agg || { date: d, total: 0, count: 0 });
    }
    return days;
  }, [byDate]);

  const selectedLogs = useMemo(() => {
    return logs
      .filter((l) => l.date === selectedDate)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [logs, selectedDate]);

  async function addLog(e: React.FormEvent) {
    e.preventDefault();
    if (!bookId) return;

    const entry: ReadingLog = {
      id: uuid(),
      date: selectedDate,
      bookId,
      pages: pages > 0 ? pages : undefined,
      minutes: minutes > 0 ? minutes : undefined,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await db.logs.add(entry);
    window.dispatchEvent(new Event("quiet-shelf:db-changed"));

    setNote("");
    // keep pages/minutes as quick defaults
  }

  async function removeLog(id: string) {
    await db.logs.delete(id);
    window.dispatchEvent(new Event("quiet-shelf:db-changed"));
  }

  return (
    <div className="grid2">
      <div className="card">
        <h2 className="sectionTitle">Daily</h2>
        <div className="hint" style={{ marginBottom: 10 }}>
          Heatmap = last 365 days. Click a square to see that day.
        </div>

        <div className="heatmap" role="grid" aria-label="Reading heatmap">
          {heatDays.map((d) => (
            <div
              key={d.date}
              className={`cell ${intensityLevel(d.total)}`}
              title={`${d.date} • ${d.count} log(s)`}
              onClick={() => setSelectedDate(d.date)}
              role="button"
              tabIndex={0}
            />
          ))}
        </div>

        <div className="hint" style={{ marginTop: 8 }}>
          Tip: pages/minutes are optional — logging *anything* makes the day show up.
        </div>
      </div>

      <div className="card">
        <h2 className="sectionTitle">{dayjs(selectedDate).format("MMM D, YYYY")}</h2>

        <form className="row" onSubmit={addLog}>
          <div className="field">
            <label className="label">Book</label>
            <select className="select" value={bookId} onChange={(e) => setBookId(e.target.value)}>
              <option value="" disabled>Select a book</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.authors?.[0] || "Unknown"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid2">
            <div className="field">
              <label className="label">Pages</label>
              <input className="input" type="number" value={pages} onChange={(e) => setPages(Number(e.target.value))} />
            </div>
            <div className="field">
              <label className="label">Minutes</label>
              <input className="input" type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
            </div>
          </div>

          <div className="field">
            <label className="label">Note (optional)</label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="one quick thought…" />
          </div>

          <div className="actions">
            <button className="button" type="submit" disabled={!books.length}>
              Add log
            </button>
          </div>
        </form>

        <h3 className="sectionTitle" style={{ marginTop: 14 }}>Logs</h3>
        <ul className="list">
          {selectedLogs.map((l) => {
            const b = bookMap.get(l.bookId);
            return (
              <li key={l.id} className="li">
                <img className="cover" src={b?.coverUrl || ""} alt="" />
                <div>
                  <div className="resultTitle">{b?.title || "Unknown book"}</div>
                  <div className="muted">
                    {(l.pages ? `${l.pages} pages` : "")}
                    {(l.pages && l.minutes ? " • " : "")}
                    {(l.minutes ? `${l.minutes} min` : "")}
                  </div>
                  {l.note ? <div className="muted" style={{ marginTop: 6 }}>{l.note}</div> : null}
                </div>
                <button className="button" onClick={() => removeLog(l.id)}>✕</button>
              </li>
            );
          })}

          {selectedLogs.length === 0 && (
            <li className="small" style={{ opacity: 0.75 }}>
              No logs for this day yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
