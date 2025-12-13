import React, { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { db } from "../db";
import type { Book, BookStatus } from "../types";
import type { GoogleBookResult } from "../googleBooks";
import { getBookCoverUrl } from "../utils/placeholders";

type BookDetailsFormProps = {
  selectedBook: GoogleBookResult;
  onSave: () => void;
};

const BOOK_STATUSES: { value: BookStatus; label: string }[] = [
  { value: "tbr", label: "TBR" },
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
  { value: "dnf", label: "DNF" },
];

function getTodayDate() {
  return dayjs().format("YYYY-MM-DD");
}

function getDateLabel(status: BookStatus): string {
  switch (status) {
    case "reading":
      return "Started on";
    case "finished":
      return "Finished on";
    case "dnf":
      return "DNF on";
    default:
      return "Date";
  }
}

export default function BookDetailsForm({ selectedBook, onSave }: BookDetailsFormProps) {
  const [status, setStatus] = useState<BookStatus>("tbr");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<string>(getTodayDate());

  const tagList = useMemo(() => {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [tags]);

  async function handleSave() {
    const now = new Date().toISOString();

    const book: Book = {
      id: uuid(),
      googleVolumeId: selectedBook.volumeId,
      title: selectedBook.title,
      authors: selectedBook.authors,
      pageCount: selectedBook.pageCount,
      publishedDate: selectedBook.publishedDate,
      description: selectedBook.description,
      genres: selectedBook.categories,
      coverUrl: selectedBook.thumbnail,
      status,
      startedOn: status === "reading" ? date : undefined,
      finishedOn: status === "finished" ? date : undefined,
      dnfOn: status === "dnf" ? date : undefined,
      tags: tagList,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    await db.books.add(book);
    window.dispatchEvent(new Event("quiet-shelf:db-changed"));

    // Reset form
    setStatus("tbr");
    setTags("");
    setNotes("");
    setDate(getTodayDate());
    onSave();
  }

  return (
    <>
      <div className="selectedBookPreview">
        <img
          className="selectedBookCover"
          src={getBookCoverUrl(selectedBook.thumbnail)}
          alt=""
        />
        <div className="selectedBookInfo">
          <div className="selectedBookTitle">{selectedBook.title}</div>
          <div className="selectedBookAuthor">
            {selectedBook.authors?.join(", ") || "Unknown author"}
          </div>
          <div className="tagList">
            {(selectedBook.categories || []).slice(0, 4).map((category) => (
              <span className="tag" key={category}>
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="field">
          <label className="label">Status</label>
          <select
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value as BookStatus)}
          >
            {BOOK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="hint">Set TBR/Reading/Finished/DNF.</div>
        </div>

        <div className="field">
          <label className="label">{getDateLabel(status)}</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="hint">Used for started/finished/DNF dates.</div>
        </div>
      </div>

      <div className="field" style={{ marginTop: 10 }}>
        <label className="label">Tags (comma separated)</label>
        <input
          className="input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. horror, gothic, slow-burn"
        />
      </div>

      <div className="field" style={{ marginTop: 10 }}>
        <label className="label">Notes</label>
        <textarea
          className="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything you want to remember…"
        />
      </div>

      <div className="actions">
        <button className="button" onClick={handleSave}>
          Save to library
        </button>
      </div>
    </>
  );
}
