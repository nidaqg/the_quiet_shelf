import { useMemo } from "react";
import type { Book, BookStatus } from "../types";

export function useLibraryFilters(
  books: Book[],
  statusFilter: BookStatus | "all",
  genreFilter: string,
  searchQuery: string
) {
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    for (const book of books) {
      for (const genre of book.genres) {
        genreSet.add(genre);
      }
    }
    return ["all", ...Array.from(genreSet).sort((a, b) => a.localeCompare(b))];
  }, [books]);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return books
      .filter((book) => (statusFilter === "all" ? true : book.status === statusFilter))
      .filter((book) => (genreFilter === "all" ? true : book.genres.includes(genreFilter)))
      .filter((book) => {
        if (!query) return true;
        const searchText = `${book.title} ${book.authors.join(" ")} ${book.tags.join(" ")}`.toLowerCase();
        return searchText.includes(query);
      });
  }, [books, statusFilter, genreFilter, searchQuery]);

  return { genres, filteredBooks };
}
