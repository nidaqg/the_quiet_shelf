import React, { useState } from "react";
import dayjs from "dayjs";
import { db } from "../db";
import type { Book, BookStatus } from "../types";
import BookList from "../components/BookList.tsx";
import { useLibraryFilters } from "../hooks/useLibraryFilters";

type Props = {
  books: Book[];
  counts: Record<BookStatus, number>;
};

const STATUS_LABELS: Record<BookStatus, string> = {
  tbr: "TBR",
  reading: "Reading",
  finished: "Finished",
  dnf: "DNF",
};

export default function Library({ books, counts }: Props) {
  const [statusFilter, setStatusFilter] = useState<BookStatus | "all">("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { tags, filteredBooks } = useLibraryFilters(
    books,
    statusFilter,
    tagFilter,
    searchQuery
  );

  // Separate DNF books from the main library
  const nonDnfBooks = filteredBooks.filter((book) => book.status !== "dnf");
  const dnfBooks = filteredBooks.filter((book) => book.status === "dnf");
  const libraryTotal = books.filter((book) => book.status !== "dnf").length;

  async function handleCycleStatus(book: Book) {
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
      startedOn: nextStatus === "reading" ? (book.startedOn || today) : book.startedOn,
      finishedOn: nextStatus === "finished" ? (book.finishedOn || today) : book.finishedOn,
      dnfOn: nextStatus === "dnf" ? (book.dnfOn || today) : book.dnfOn,
    });
    window.dispatchEvent(new Event("quiet-shelf:db-changed"));
  }

  async function handleRemoveBook(id: string) {
    await db.transaction("rw", db.books, db.logs, async () => {
      await db.logs.where("bookId").equals(id).delete();
      await db.books.delete(id);
    });
    window.dispatchEvent(new Event("quiet-shelf:db-changed"));
  }

  return (
    <div className="libraryPage">
      <div className="card">
        <h2 className="sectionTitle">Library</h2>

        <div className="grid2">
          <div className="field">
            <label className="label">Status</label>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookStatus | "all")}
            >
              <option value="all">All</option>
              <option value="reading">Reading ({counts.reading})</option>
              <option value="tbr">To Be Read ({counts.tbr})</option>
              <option value="finished">Finished ({counts.finished})</option>
              <option value="dnf">Did Not Finish ({counts.dnf})</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Tag</label>
            <select
              className="select"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            >
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag === "all" ? "All" : tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field" style={{ marginTop: 10 }}>
          <label className="label">Search</label>
          <input
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, author, tags…"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <BookList
            books={nonDnfBooks}
            onCycleStatus={handleCycleStatus}
            onRemove={handleRemoveBook}
            statusLabels={STATUS_LABELS}
          />
        </div>

        {dnfBooks.length > 0 && (
          <>
            <h3 className="sectionTitle" style={{ marginTop: 24, marginBottom: 12 }}>
              Did Not Finish
            </h3>
            <BookList
              books={dnfBooks}
              onCycleStatus={handleCycleStatus}
              onRemove={handleRemoveBook}
              statusLabels={STATUS_LABELS}
            />
          </>
        )}
      </div>
    </div>
  );
}
