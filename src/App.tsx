import { useMemo, useState } from "react";
import type { BookStatus } from "./types";
import AddBook from "./pages/AddBook.tsx";
import Library from "./pages/Library.tsx";
import Monthly from "./pages/Monthly.tsx";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import { useBooks } from "./hooks/useBooks";
import { useTheme } from "./hooks/useTheme";

type Tab = "add" | "library" | "monthly";

export const DB_CHANGED_EVENT = "quiet-shelf:db-changed";

export default function App() {
  const [tab, setTab] = useState<Tab>("add");
  const { books, logs } = useBooks();
  const { theme, setTheme } = useTheme();

  const counts = useMemo(() => {
    const byStatus: Record<BookStatus, number> = {
      tbr: 0,
      reading: 0,
      finished: 0,
      dnf: 0,
    };
    for (const b of books) byStatus[b.status] += 1;
    return byStatus;
  }, [books]);

  const libraryCount = useMemo(() => {
    return books.filter((b) => b.status !== "dnf").length;
  }, [books]);

  return (
    <div className="page">
      <Header currentTab={tab} onTabChange={setTab} bookCount={libraryCount} theme={theme} onThemeChange={setTheme} />

      <div className="mainContent">
        {tab === "add" && <AddBook />}
        {tab === "library" && <Library books={books} counts={counts} />}
        {tab === "monthly" && <Monthly books={books} logs={logs} />}

      <Footer 
        message={
          tab === "add" 
            ? <>built by <a href="https://github.com/nidaqg" target="_blank" rel="noopener noreferrer">@nidaqg</a></> 
            : tab === "library" 
              ? "Tip: use custom tags to organize your reading list!"
            : "Tip: log your reading sessions to see them on the calendar!"
        }
      />
      </div>
    </div>
  );
}
