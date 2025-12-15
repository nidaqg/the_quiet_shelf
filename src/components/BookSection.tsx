import BookList from "./BookList";
import type { Book, BookStatus } from "../types";

type Props = {
  books: Book[];
  onCycleStatus: (book: Book) => void;
  onRemove: (id: string) => void;
  statusLabels: Record<BookStatus, string>;
};

export default function BookSection({
  books,
  onCycleStatus,
  onRemove,
  statusLabels,
}: Props) {
  if (books.length === 0) return null;

  return (
    <BookList
      books={books}
      onCycleStatus={onCycleStatus}
      onRemove={onRemove}
      statusLabels={statusLabels}
    />
  );
}
