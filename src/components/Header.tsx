import React from "react";
import ThemeToggle from "./ThemeToggle";
import type { Theme } from "../hooks/useTheme";

type Tab = "add" | "library" | "daily" | "monthly";

type HeaderProps = {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  bookCount: number;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export default function Header({ currentTab, onTabChange, bookCount, theme, onThemeChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleTabClick = (tab: Tab) => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  const navItems: { tab: Tab; label: string }[] = [
    { tab: "add", label: "Add" },
    { tab: "library", label: `Library (${bookCount})` },
    { tab: "daily", label: "Daily" },
    { tab: "monthly", label: "Monthly" },
  ];

  return (
    <header className="header">
      <div>
        <h1 className="title">The Quiet Shelf</h1>
        <p className="subtitle">Track your reading, your way.</p>
      </div>

      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        {navItems.map(({ tab, label }) => (
          <button
            key={tab}
            className="navLink"
            aria-pressed={currentTab === tab}
            onClick={() => handleTabClick(tab)}
          >
            {label}
          </button>
        ))}
        
        <div className="themeToggleWrapper">
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        </div>
      </nav>
    </header>
  );
}
