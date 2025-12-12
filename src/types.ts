export type BookStatus = "reading" | "finished" | "dnf" | "tbr";

export type Book = {
  id: string;
  googleVolumeId: string;

  title: string;
  authors: string[];
  pageCount?: number;
  publishedDate?: string;
  description?: string;

  genres: string[];     // from Google categories (normalized)
  coverUrl?: string;

  status: BookStatus;
  startedOn?: string;   // YYYY-MM-DD
  finishedOn?: string;  // YYYY-MM-DD
  dnfOn?: string;       // YYYY-MM-DD

  tags: string[];
  notes?: string;

  createdAt: string;
  updatedAt: string;
};

export type ReadingLog = {
  id: string;
  date: string;     // YYYY-MM-DD
  bookId: string;
  minutes?: number;
  pages?: number;
  note?: string;
  createdAt: string;
};
