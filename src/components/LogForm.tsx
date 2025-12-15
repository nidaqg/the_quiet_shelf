import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import { db } from "../db";
import type { Book, ReadingLog } from "../types";

type LogFormProps = {
  books: Book[];
  selectedDate: string;
  formattedDate: string;
};

export default function LogForm({ books, selectedDate, formattedDate }: LogFormProps) {
  const [bookId, setBookId] = useState<string>("");
  const [pages, setPages] = useState<number>(10);
  const [minutes, setMinutes] = useState<number>(0);
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
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
  }

  return (
    <div className="card">
      <h2 className="sectionTitle">{formattedDate}</h2>

      <form className="row" onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Book</label>
          <select className="select" value={bookId} onChange={(e) => setBookId(e.target.value)}>
            <option value="" disabled>
              Select a book
            </option>
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
            <input
              className="input"
              type="number"
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label className="label">Minutes</label>
            <input
              className="input"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Note (optional)</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="one quick thought…"
          />
        </div>

        <div className="actions">
          <button className="button" type="submit" disabled={!books.length}>
            Add log
          </button>
        </div>
      </form>
    </div>
  );
}
