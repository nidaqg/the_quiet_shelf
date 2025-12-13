import { useCallback } from "react";
import dayjs from "dayjs";
import { db } from "../db";
import type { Book, BookStatus } from "../types";

export function useBookActions() {
  const cycleStatus = useCallback(async (book: Book) => {
    const nextStatus: BookStatus =
      book.status === "tbr"
        ? "reading"
        : book.status === "reading"
        ? "finished"
        : book.status === "finished"
        ? "dnf"
        : "tbr";

    const now = new Date().toISOString();
    const today = dayjs().format("YYYY-MM-DD");

    await db.books.update(book.id, {
      status: nextStatus,
      updatedAt: now,
      startedOn:
        nextStatus === "reading" ? book.startedOn || today : book.startedOn,
      finishedOn:
        nextStatus === "finished" ? book.finishedOn || today : book.finishedOn,
      dnfOn: nextStatus === "dnf" ? book.dnfOn || today : book.dnfOn,
    });
    window.dispatchEvent(new Event("quiet-shelf:db-changed"));
  }, []);

  const removeBook = useCallback(async (id: string) => {
    await db.transaction("rw", db.books, db.logs, async () => {
      await db.logs.where("bookId").equals(id).delete();
      await db.books.delete(id);
    });
    window.dispatchEvent(new Event("quiet-shelf:db-changed"));
  }, []);

  return { cycleStatus, removeBook };
}
