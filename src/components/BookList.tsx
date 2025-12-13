import React from "react";
import type { Book } from "../types";

type BookListProps = {
  books: Book[];
  onCycleStatus: (book: Book) => void;
  onRemove: (id: string) => void;
  statusLabels: Record<string, string>;
};

export default function BookList({ books, onCycleStatus, onRemove, statusLabels }: BookListProps) {
  if (books.length === 0) {
    return (
      <p className="emptyMessage">
        Nothing here yet. Try Add → search a title → save it.
      </p>
    );
  }

  return (
    <ul className="bookList">
      {books.map((book) => (
        <li key={book.id} className="bookListItem">
          <img className="bookCover" src={book.coverUrl || ""} alt="" />
          <div className="bookDetails">
            <div className="bookTitle">{book.title}</div>
            <div className="bookMeta">
              {book.authors.join(", ") || "Unknown author"} •{" "}
              <strong>{statusLabels[book.status]}</strong>
            </div>
            <div className="tagList">
              {book.genres.slice(0, 3).map((genre) => (
                <span key={genre} className="tag">
                  {genre}
                </span>
              ))}
              {book.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            {book.notes && <div className="bookNotes">{book.notes}</div>}
          </div>
          <div className="bookActions">
            <button
              className="button"
              onClick={() => onCycleStatus(book)}
              title="Cycle status"
            >
              {statusLabels[book.status]}
            </button>
            <button
              className="button"
              onClick={() => onRemove(book.id)}
              title="Remove book"
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
