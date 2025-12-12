import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { db } from "./db";
import type { Book, BookStatus, ReadingLog } from "./types";
import AddBook from "./pages/AddBook.tsx";
import Library from "./pages/Library.tsx";
import Daily from "./pages/Daily.tsx";
import Monthly from "./pages/Monthly.tsx";

type Tab = "add" | "library" | "daily" | "monthly";

export const DB_CHANGED_EVENT = "quiet-shelf:db-changed";

export default function App() {
  const [tab, setTab] = useState<Tab>("add");
  const [books, setBooks] = useState<Book[]>([]);
  const [logs, setLogs] = useState<ReadingLog[]>([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const [b, l] = await Promise.all([
          db.books.orderBy("updatedAt").reverse().toArray(),
          db.logs.orderBy("date").toArray(),
        ]);
        if (!alive) return;
        setBooks(b);
        setLogs(l);
      } catch (e) {
        console.error("Failed to load from IndexedDB:", e);
      }
    }

    // initial load
    load();

    // reload on custom event fired by mutations
    const handler = () => load();
    window.addEventListener(DB_CHANGED_EVENT, handler);

    return () => {
      alive = false;
      window.removeEventListener(DB_CHANGED_EVENT, handler);
    };
  }, []);

  const counts = useMemo(() => {
    const byStatus: Record<BookStatus, number> = {
      tbr: 0,
      reading: 0,
      finished: 0,
      dnf: 0,
    };
    for (const b of books) byStatus[b.status] += 1;
    return byStatus;
  }, [books]);


  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="title">The Quiet Shelf</h1>
          <p className="subtitle">Track your reading, your way.</p>
        </div>

        <nav className="nav">
          <button className="chip" aria-pressed={tab === "add"} onClick={() => setTab("add")}>
            Add
          </button>
          <button className="chip" aria-pressed={tab === "library"} onClick={() => setTab("library")}>
            Library ({books.length})
          </button>
          <button className="chip" aria-pressed={tab === "daily"} onClick={() => setTab("daily")}>
            Daily
          </button>
          <button className="chip" aria-pressed={tab === "monthly"} onClick={() => setTab("monthly")}>
            Monthly
          </button>
        </nav>
      </header>
      <>
        {tab === "add" && <AddBook />}
        {tab === "library" && <Library books={books} counts={counts} />}
        {tab === "daily" && <Daily books={books} logs={logs} />}
        {tab === "monthly" && <Monthly books={books} logs={logs} />}
      </>
      <footer className="footer">
        <span>Tip: log a quick session each day to power the heatmap + monthly covers.</span>
      </footer>
    </div>
  );
}
