import BookList from "./BookList";
import type { Book, BookStatus } from "../types";

type Props = {
  title: string;
  books: Book[];
  onCycleStatus: (book: Book) => void;
  onRemove: (id: string) => void;
  statusLabels: Record<BookStatus, string>;
};

export default function BookSection({
  title,
  books,
  onCycleStatus,
  onRemove,
  statusLabels,
}: Props) {
  if (books.length === 0) return null;

  return (
    <>
      <h3 className="sectionTitle" style={{ marginTop: 24, marginBottom: 12 }}>
        {title}
      </h3>
      <BookList
        books={books}
        onCycleStatus={onCycleStatus}
        onRemove={onRemove}
        statusLabels={statusLabels}
      />
    </>
  );
}
