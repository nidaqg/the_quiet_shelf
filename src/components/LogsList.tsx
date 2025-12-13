import { db } from "../db";
import type { Book, ReadingLog } from "../types";
import { getBookCoverUrl } from "../utils/placeholders";

type LogsListProps = {
  logs: ReadingLog[];
  bookMap: Map<string, Book>;
};

async function handleRemoveLog(id: string) {
  await db.logs.delete(id);
  window.dispatchEvent(new Event("quiet-shelf:db-changed"));
}

export default function LogsList({ logs, bookMap }: LogsListProps) {
  if (logs.length === 0) {
    return (
      <p className="emptyMessage">No logs for this day yet.</p>
    );
  }

  return (
    <ul className="logsList">
      {logs.map((log) => {
        const book = bookMap.get(log.bookId);
        const details = [
          log.pages ? `${log.pages} pages` : null,
          log.minutes ? `${log.minutes} min` : null,
        ]
          .filter(Boolean)
          .join(" • ");

        return (
          <li key={log.id} className="logItem">
            <img className="bookCover" src={getBookCoverUrl(book?.coverUrl)} alt="" />
            <div className="logDetails">
              <div className="logTitle">{book?.title || "Unknown book"}</div>
              {details && <div className="logMeta">{details}</div>}
              {log.note && <div className="logNote">{log.note}</div>}
            </div>
            <button
              className="bookActionButton"
              onClick={() => handleRemoveLog(log.id)}
              aria-label="Remove log"
            >
              ✕
            </button>
          </li>
        );
      })}
    </ul>
  );
}
