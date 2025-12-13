import React, { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { db } from "../db";
import type { Book, BookStatus } from "../types";
import { searchGoogleBooksByTitle, GoogleBookResult } from "../googleBooks";

const statuses: { value: BookStatus; label: string }[] = [
  { value: "tbr", label: "TBR" },
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
  { value: "dnf", label: "DNF" },
];

function today() {
  return dayjs().format("YYYY-MM-DD");
}

export default function AddBook() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<GoogleBookResult | null>(null);

  const [status, setStatus] = useState<BookStatus>("tbr");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [dateA, setDateA] = useState<string>(today()); // used for start/finish/dnf depending on status

  const tagList = useMemo(() => {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tags]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setSelected(null);
    setResults([]);

    try {
      const r = await searchGoogleBooksByTitle(q);
      setResults(r);
      if (r.length === 0) setError("No results found. Try adding author keywords.");
    } catch (err: any) {
      setError(err?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSelected() {
    if (!selected) return;

    const now = new Date().toISOString();

    const book: Book = {
      id: uuid(),
      googleVolumeId: selected.volumeId,
      title: selected.title,
      authors: selected.authors,
      pageCount: selected.pageCount,
      publishedDate: selected.publishedDate,
      description: selected.description,
      genres: selected.categories,
      coverUrl: selected.thumbnail,
      status,
      startedOn: status === "reading" ? dateA : undefined,
      finishedOn: status === "finished" ? dateA : undefined,
      dnfOn: status === "dnf" ? dateA : undefined,
      tags: tagList,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    await db.books.add(book);
    window.dispatchEvent(new Event("quiet-shelf:db-changed"));

    // reset form but keep query/results
    setSelected(null);
    setStatus("tbr");
    setTags("");
    setNotes("");
    setDateA(today());
  }

  return (
    <div className="split">
      <div className="card">
        <h2 className="sectionTitle">Add a book</h2>

        <form className="row" onSubmit={handleSearch}>
          <div className="field">
            <label className="label" htmlFor="q">Title</label>
            <input
              id="q"
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
            <h3 className="sectionTitle" style={{ marginTop: 14 }}>Results</h3>
            <div className="results">
              {results.map((r) => (
                <div
                  key={r.volumeId}
                  className="result"
                  onClick={() => setSelected(r)}
                  role="button"
                  tabIndex={0}
                >
                  <img className="cover" src={r.thumbnail || ""} alt="" />
                  <div>
                    <div className="resultTitle">{r.title}</div>
                    <div className="muted">
                      {(r.authors?.join(", ") || "Unknown author")}
                      {r.pageCount ? ` • ${r.pageCount} pages` : ""}
                      {r.publishedDate ? ` • ${r.publishedDate}` : ""}
                    </div>
                    <div className="pills">
                      {(r.categories || []).slice(0, 3).map((c) => (
                        <span className="pill" key={c}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2 className="sectionTitle">Details</h2>

        {!selected ? (
          <p className="small">Pick a result on the left to add it to your library.</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 10 }}>
              <img className="cover" style={{ width: 64, height: 88 }} src={selected.thumbnail || ""} alt="" />
              <div>
                <div className="resultTitle">{selected.title}</div>
                <div className="muted">{selected.authors?.join(", ") || "Unknown author"}</div>
                <div className="pills">
                  {(selected.categories || []).slice(0, 4).map((c) => (
                    <span className="pill" key={c}>{c}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid2" style={{ marginTop: 12 }}>
              <div className="field">
                <label className="label">Status</label>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <div className="hint">Set TBR/Reading/Finished/DNF.</div>
              </div>

              <div className="field">
                <label className="label">
                  {status === "reading" ? "Started on" : status === "finished" ? "Finished on" : status === "dnf" ? "DNF on" : "Date"}
                </label>
                <input className="input" type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} />
                <div className="hint">Used for started/finished/DNF dates.</div>
              </div>
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label className="label">Tags (comma separated)</label>
              <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. horror, gothic, slow-burn" />
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label className="label">Notes</label>
              <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you want to remember…" />
            </div>

            <div className="actions">
              <button className="button" onClick={saveSelected}>Save to library</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
