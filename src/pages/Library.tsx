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
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { genres, filteredBooks } = useLibraryFilters(
    books,
    statusFilter,
    genreFilter,
    searchQuery
  );

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
              <option value="all">All ({books.length})</option>
              <option value="reading">Reading ({counts.reading})</option>
              <option value="tbr">TBR ({counts.tbr})</option>
              <option value="finished">Finished ({counts.finished})</option>
              <option value="dnf">DNF ({counts.dnf})</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Genre</label>
            <select
              className="select"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === "all" ? "All" : genre}
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
            books={filteredBooks}
            onCycleStatus={handleCycleStatus}
            onRemove={handleRemoveBook}
            statusLabels={STATUS_LABELS}
          />
        </div>
      </div>
    </div>
  );
}
