import { useState } from "react";
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

  function handleCancel() {
    setSelectedBook(null);
  }

  return (
    <>
      <div className="addBookPage">
        <div className="card">
          <h2 className="sectionTitle">Add a book</h2>
          <BookSearch onSelectBook={handleSelectBook} />
        </div>
      </div>

      {selectedBook && (
        <div className="modalOverlay" onClick={handleCancel}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2 className="modalTitle">Add Book Details</h2>
              <button className="modalClose" onClick={handleCancel}>
                ✕
              </button>
            </div>
            <div className="modalBody">
              <BookDetailsForm 
                selectedBook={selectedBook} 
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
