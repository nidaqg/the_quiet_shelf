import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { db } from "../db";
import type { Book, BookStatus } from "../types";

type Props = {
  books: Book[];
  counts: Record<BookStatus, number>;
};

const statusLabels: Record<BookStatus, string> = {
  tbr: "TBR",
  reading: "Reading",
  finished: "Finished",
  dnf: "DNF",
};

export default function Library({ books, counts }: Props) {
  const [status, setStatus] = useState<BookStatus | "all">("all");
  const [genre, setGenre] = useState<string>("all");
  const [search, setSearch] = useState("");

  const genres = useMemo(() => {
    const set = new Set<string>();
    for (const b of books) for (const g of b.genres) set.add(g);
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [books]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return books
      .filter((b) => (status === "all" ? true : b.status === status))
      .filter((b) => (genre === "all" ? true : b.genres.includes(genre)))
      .filter((b) => {
        if (!s) return true;
        const hay = `${b.title} ${b.authors.join(" ")} ${b.tags.join(" ")}`.toLowerCase();
        return hay.includes(s);
      });
  }, [books, status, genre, search]);

  async function cycleStatus(book: Book) {
    const next: BookStatus =
      book.status === "tbr" ? "reading" :
      book.status === "reading" ? "finished" :
      book.status === "finished" ? "dnf" :
      "tbr";

    const now = new Date().toISOString();
    await db.books.update(book.id, {
      status: next,
      updatedAt: now,
      startedOn: next === "reading" ? (book.startedOn || dayjs().format("YYYY-MM-DD")) : book.startedOn,
      finishedOn: next === "finished" ? (book.finishedOn || dayjs().format("YYYY-MM-DD")) : book.finishedOn,
      dnfOn: next === "dnf" ? (book.dnfOn || dayjs().format("YYYY-MM-DD")) : book.dnfOn,
    });
  }

  async function removeBook(id: string) {
    // Also remove logs for it
    await db.transaction("rw", db.books, db.logs, async () => {
      await db.logs.where("bookId").equals(id).delete();
      await db.books.delete(id);
    });
  }

  return (
    <div className="card">
      <h2 className="sectionTitle">Library</h2>

      <div className="grid2">
        <div className="field">
          <label className="label">Status</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="all">All ({books.length})</option>
            <option value="reading">Reading ({counts.reading})</option>
            <option value="tbr">TBR ({counts.tbr})</option>
            <option value="finished">Finished ({counts.finished})</option>
            <option value="dnf">DNF ({counts.dnf})</option>
          </select>
        </div>

        <div className="field">
          <label className="label">Genre</label>
          <select className="select" value={genre} onChange={(e) => setGenre(e.target.value)}>
            {genres.map((g) => (
              <option key={g} value={g}>{g === "all" ? "All" : g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field" style={{ marginTop: 10 }}>
        <label className="label">Search</label>
        <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, author, tags…" />
      </div>

      <ul className="list" style={{ marginTop: 12 }}>
        {filtered.map((b) => (
          <li key={b.id} className="li">
            <img className="cover" src={b.coverUrl || ""} alt="" />
            <div>
              <div className="resultTitle">{b.title}</div>
              <div className="muted">
                {b.authors.join(", ") || "Unknown author"} • <strong>{statusLabels[b.status]}</strong>
              </div>
              <div className="pills">
                {b.genres.slice(0, 3).map((g) => <span key={g} className="pill">{g}</span>)}
                {b.tags.slice(0, 3).map((t) => <span key={t} className="pill">{t}</span>)}
              </div>
              {b.notes ? <div className="muted" style={{ marginTop: 6 }}>{b.notes}</div> : null}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="button" onClick={() => cycleStatus(b)} title="Cycle status">
                {statusLabels[b.status]}
              </button>
              <button className="button" onClick={() => removeBook(b.id)} title="Remove book">
                ✕
              </button>
            </div>
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="small" style={{ opacity: 0.75 }}>
            Nothing here yet. Try Add → search a title → save it.
          </li>
        )}
      </ul>
    </div>
  );
}
