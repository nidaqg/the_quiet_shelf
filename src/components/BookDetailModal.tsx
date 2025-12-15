import { useState, useEffect } from "react";
import type { Book, BookStatus } from "../types";
import { db } from "../db";
import { getBookCoverUrl } from "../utils/placeholders";
import { DB_CHANGED_EVENT } from "../App";
import dayjs from "dayjs";
import StarRating from "./StarRating";

type BookDetailModalProps = {
  book: Book;
  onClose: () => void;
};

export default function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const [status, setStatus] = useState<BookStatus>(book.status);
  const [tags, setTags] = useState(book.tags.join(", "));
  const [notes, setNotes] = useState(book.notes || "");
  const [rating, setRating] = useState(book.rating || 0);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync form state when book prop changes
  useEffect(() => {
    setStatus(book.status);
    setTags(book.tags.join(", "));
    setNotes(book.notes || "");
    setRating(book.rating || 0);
    setConfirmDelete(false);
  }, [book]);

  async function handleSave() {
    setSaving(true);
    try {
      const today = dayjs().format("YYYY-MM-DD");
      const updates: Partial<Book> = {
        status,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        notes: notes.trim() || undefined,
        rating: rating > 0 ? rating : undefined,
        updatedAt: new Date().toISOString(),
      };

      // Update status dates if status changed
      if (status !== book.status) {
        if (status === "reading") {
          updates.startedOn = book.startedOn || today;
        } else if (status === "finished") {
          updates.finishedOn = book.finishedOn || today;
        } else if (status === "dnf") {
          updates.dnfOn = book.dnfOn || today;
        }
      }

      await db.books.update(book.id, updates);
      window.dispatchEvent(new Event(DB_CHANGED_EVENT));
      onClose();
    } catch (error) {
      console.error("Failed to update book:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setSaving(true);
    try {
      await db.books.delete(book.id);
      window.dispatchEvent(new Event(DB_CHANGED_EVENT));
      onClose();
    } catch (error) {
      console.error("Failed to delete book:", error);
      alert("Failed to delete book");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2 className="modalTitle">Edit Book</h2>
          <button className="modalClose" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modalBody">
          <div className="bookPreview">
            <img className="bookPreviewCover" src={getBookCoverUrl(book.coverUrl)} alt="" />
            <div className="bookPreviewInfo">
              <div className="bookPreviewTitle">{book.title}</div>
              <div className="bookPreviewMeta">
                {book.authors.join(", ") || "Unknown author"}
              </div>
              {book.genres.length > 0 && (
                <div className="tagList">
                  {book.genres.map((genre) => (
                    <span key={genre} className="tag">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="field">
            <label className="label">Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>
              <option value="tbr">To Be Read</option>
              <option value="reading">Reading</option>
              <option value="finished">Finished</option>
              <option value="dnf">Did Not Finish</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Tags</label>
            <input
              className="input"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="fiction, thriller, must-read"
            />
            <div className="hint">Comma-separated</div>
          </div>

          <div className="field">
            <label className="label">Notes</label>
            <textarea
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your thoughts about this book..."
            />
          </div>

          <div className="field">
            <label className="label">Rating</label>
            <StarRating rating={rating} onChange={setRating} />
          </div>
        </div>

        <div className="modalFooter">
          <button className="button deleteButton" onClick={handleDelete} disabled={saving}>
            {confirmDelete ? "Click again to confirm Delete" : "Delete"}
          </button>
          <button className="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
