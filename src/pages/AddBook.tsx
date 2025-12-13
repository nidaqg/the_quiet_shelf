import React, { useState } from "react";
import type { GoogleBookResult } from "../googleBooks";
import BookSearch from "../components/BookSearch.tsx";
import BookDetailsForm from "../components/BookDetailsForm.tsx";

export default function AddBook() {
  const [selectedBook, setSelectedBook] = useState<GoogleBookResult | null>(null);

  function handleSelectBook(book: GoogleBookResult) {
    setSelectedBook(book);
  }

  function handleSave() {
    setSelectedBook(null);
  }

  return (
    <div className="addBookPage">
      <div className="card">
        <h2 className="sectionTitle">Add a book</h2>
        <BookSearch onSelectBook={handleSelectBook} />
      </div>

      <div className="card">
        <h2 className="sectionTitle">Details</h2>
        {!selectedBook ? (
          <p className="emptyMessage">Pick a result on the left to add it to your library.</p>
        ) : (
          <BookDetailsForm selectedBook={selectedBook} onSave={handleSave} />
        )}
      </div>
    </div>
  );
}
