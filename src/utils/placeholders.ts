// Placeholder image for books without covers
export const PLACEHOLDER_BOOK_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='140' viewBox='0 0 100 140'%3E%3Crect width='100' height='140' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M30 50h40v2H30zm0 10h40v2H30zm0 10h30v2H30z' fill='%23ffffff' fill-opacity='0.3'/%3E%3Ctext x='50' y='90' font-family='sans-serif' font-size='12' fill='%23ffffff' fill-opacity='0.5' text-anchor='middle'%3ENo Cover%3C/text%3E%3C/svg%3E";

export function getBookCoverUrl(coverUrl: string | undefined): string {
  return coverUrl || PLACEHOLDER_BOOK_COVER;
}
