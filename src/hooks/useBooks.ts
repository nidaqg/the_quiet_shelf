import { useEffect, useState } from "react";
import { db } from "../db";
import type { Book, ReadingLog } from "../types";
import { DB_CHANGED_EVENT } from "../App";

export function useBooks() {
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

  return { books, logs };
}
