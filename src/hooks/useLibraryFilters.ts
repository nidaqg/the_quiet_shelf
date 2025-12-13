import { useMemo } from "react";
import type { Book, BookStatus } from "../types";

export function useLibraryFilters(
  books: Book[],
  statusFilter: BookStatus | "all",
  tagFilter: string,
  searchQuery: string
) {
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const book of books) {
      for (const tag of book.tags) {
        tagSet.add(tag);
      }
    }
    return ["all", ...Array.from(tagSet).sort((a, b) => a.localeCompare(b))];
  }, [books]);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return books
      .filter((book) => (statusFilter === "all" ? true : book.status === statusFilter))
      .filter((book) => (tagFilter === "all" ? true : book.tags.includes(tagFilter)))
      .filter((book) => {
        if (!query) return true;
        const searchText = `${book.title} ${book.authors.join(" ")} ${book.tags.join(" ")}`.toLowerCase();
        return searchText.includes(query);
      });
  }, [books, statusFilter, tagFilter, searchQuery]);

  return { tags, filteredBooks };
}
