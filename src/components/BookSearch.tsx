import React, { useState } from "react";
import { searchGoogleBooksByTitle, GoogleBookResult } from "../googleBooks";
import { getBookCoverUrl } from "../utils/placeholders";

type BookSearchProps = {
  onSelectBook: (book: GoogleBookResult) => void;
};

export default function BookSearch({ onSelectBook }: BookSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const searchQuery = query.trim();
    if (!searchQuery) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const searchResults = await searchGoogleBooksByTitle(searchQuery);
      setResults(searchResults);
      if (searchResults.length === 0) {
        setError("No results found. Try adding author keywords.");
      }
    } catch (err: any) {
      setError(err?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="searchForm" onSubmit={handleSearch}>
        <div className="field">
          <label className="label" htmlFor="bookSearchQuery">
            Title
          </label>
          <input
            id="bookSearchQuery"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. The Hobbit"
          />
          <div className="hint">Search by title, then click the correct result.</div>
        </div>

        <div className="actions">
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {error && <div className="error">⚠️ {error}</div>}
      </form>

      {results.length > 0 && (
        <>
          <h3 className="sectionTitle" style={{ marginTop: 14 }}>
            Results
          </h3>
          <div className="searchResults">
            {results.map((result) => (
              <button
                key={result.volumeId}
                className="searchResultItem"
                onClick={() => onSelectBook(result)}
                type="button"
              >
                <img
                  className="searchResultCover"
                  src={getBookCoverUrl(result.thumbnail)}
                  alt=""
                />
                <div className="searchResultDetails">
                  <div className="searchResultTitle">{result.title}</div>
                  <div className="searchResultMeta">
                    {result.authors?.join(", ") || "Unknown author"}
                    {result.pageCount ? ` • ${result.pageCount} pages` : ""}
                    {result.publishedDate ? ` • ${result.publishedDate}` : ""}
                  </div>
                  <div className="tagList">
                    {(result.categories || []).slice(0, 3).map((category) => (
                      <span className="tag" key={category}>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
