export type GoogleBookResult = {
  volumeId: string;
  title: string;
  authors: string[];
  pageCount?: number;
  publishedDate?: string;
  description?: string;
  categories: string[];
  thumbnail?: string;
};

function normalizeGenres(categories: string[]): string[] {
  const out = new Set<string>();

  for (const c of categories) {
    // Split things like "Fiction / Horror" into pieces
    const parts = c.split("/").map((p) => p.trim()).filter(Boolean);
    for (const p of parts) {
      // normalize casing a bit
      const pretty = p
        .toLowerCase()
        .replace(/\b\w/g, (m) => m.toUpperCase());
      out.add(pretty);
    }
  }

  return Array.from(out);
}

export async function searchGoogleBooksByTitle(title: string, author?: string): Promise<GoogleBookResult[]> {
  const queryParts: string[] = [];
  
  if (title.trim()) {
    queryParts.push(`intitle:${title}`);
  }
  
  if (author?.trim()) {
    queryParts.push(`inauthor:${author}`);
  }
  
  if (queryParts.length === 0) {
    return [];
  }
  
  const q = queryParts.join('+');
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books error (HTTP ${res.status})`);

  const data = await res.json();
  const items: any[] = data.items || [];

  return items.map((it) => {
    const v = it.volumeInfo || {};
    const imageLinks = v.imageLinks || {};
    const categories = Array.isArray(v.categories) ? v.categories : [];

    return {
      volumeId: String(it.id),
      title: String(v.title || "Untitled"),
      authors: Array.isArray(v.authors) ? v.authors : [],
      pageCount: typeof v.pageCount === "number" ? v.pageCount : undefined,
      publishedDate: typeof v.publishedDate === "string" ? v.publishedDate : undefined,
      description: typeof v.description === "string" ? v.description : undefined,
      categories: normalizeGenres(categories),
      thumbnail: imageLinks.thumbnail || imageLinks.smallThumbnail || undefined
    } as GoogleBookResult;
  });
}
