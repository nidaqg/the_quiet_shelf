import { useState, useMemo } from "react";
import type { Book, BookStatus } from "../types";
import { useLibraryFilters } from "../hooks/useLibraryFilters";
import { useBookActions } from "../hooks/useBookActions";
import FilterSelect from "../components/FilterSelect";
import SearchInput from "../components/SearchInput";
import BookSection from "../components/BookSection";

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

export default function Library({ books }: Props) {
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { tags, filteredBooks } = useLibraryFilters(
    books,
    "all",
    tagFilter,
    searchQuery,
    ratingFilter
  );

  const { cycleStatus, removeBook } = useBookActions();

  // Separate books by status
  const booksByStatus = useMemo(
    () => ({
      reading: filteredBooks.filter((book) => book.status === "reading"),
      tbr: filteredBooks.filter((book) => book.status === "tbr"),
      finished: filteredBooks.filter((book) => book.status === "finished"),
      dnf: filteredBooks.filter((book) => book.status === "dnf"),
    }),
    [filteredBooks]
  );

  const tagOptions = useMemo(
    () =>
      tags.map((tag) => ({
        value: tag,
        label: tag === "all" ? "All" : tag,
      })),
    [tags]
  );

  const ratingOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      { value: "5", label: "5 Stars" },
      { value: "4", label: "4 Stars" },
      { value: "3", label: "3 Stars" },
      { value: "2", label: "2 Stars" },
      { value: "1", label: "1 Star" },
      { value: "unrated", label: "Unrated" },
    ],
    []
  );

  return (
    <div className="libraryPage">
      <div className="card libraryHeaderCard">
        <h2 className="sectionTitle">Library</h2>

        <div className="libraryFilters">
          <FilterSelect
            label="Tag"
            value={tagFilter}
            onChange={setTagFilter}
            options={tagOptions}
          />
          <div style={{ marginTop: 15 }}>
            <FilterSelect
              label="Rating"
              value={ratingFilter}
              onChange={setRatingFilter}
              options={ratingOptions}
            />
          </div>
        </div>

        <div style={{ marginTop: 15 }}>
          <SearchInput
            label="Search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search title, author, tags…"
          />
        </div>
      </div>

      {booksByStatus.reading.length > 0 && (
        <>
          <h1 className="sectionTitle">{`Currently Reading (${booksByStatus.reading.length})`}</h1>
          <div className="card libraryCards">
            <BookSection
              books={booksByStatus.reading}
              onCycleStatus={cycleStatus}
              onRemove={removeBook}
              statusLabels={STATUS_LABELS}
            />
          </div>
        </>
      )}

      {booksByStatus.tbr.length > 0 && (
        <>
          <h1 className="sectionTitle">{`To Be Read (${booksByStatus.tbr.length})`}</h1>
          <div className="card libraryCards">
            <BookSection
              books={booksByStatus.tbr}
              onCycleStatus={cycleStatus}
              onRemove={removeBook}
              statusLabels={STATUS_LABELS}
            />
          </div>
        </>
      )}

      {booksByStatus.finished.length > 0 && (
        <>
          <h1 className="sectionTitle">{`Finished Reading (${booksByStatus.finished.length})`}</h1>
          <div className="card libraryCards">
            <BookSection
              books={booksByStatus.finished}
              onCycleStatus={cycleStatus}
              onRemove={removeBook}
              statusLabels={STATUS_LABELS}
            />
          </div>
        </>
      )}

      {booksByStatus.dnf.length > 0 && (
        <>
          <h1 className="sectionTitle">{`Did Not Finish (${booksByStatus.dnf.length})`}</h1>
          <div className="card libraryCards">
            <BookSection
              books={booksByStatus.dnf}
              onCycleStatus={cycleStatus}
              onRemove={removeBook}
              statusLabels={STATUS_LABELS}
            />
          </div>
        </>
      )}
    </div>
  );
}
