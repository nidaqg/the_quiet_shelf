export type BookStatus = "reading" | "finished" | "dnf" | "tbr";

export type Book = {
  id: string;
  googleVolumeId: string;

  title: string;
  authors: string[];
  pageCount?: number;
  publishedDate?: string;
  description?: string;

  genres: string[];
  coverUrl?: string;

  status: BookStatus;
  startedOn?: string; 
  finishedOn?: string;
  dnfOn?: string;

  tags: string[];
  notes?: string;
  rating?: number;

  createdAt: string;
  updatedAt: string;
};

export type ReadingLog = {
  id: string;
  date: string;
  bookId: string;
  minutes?: number;
  pages?: number;
  note?: string;
  createdAt: string;
};
