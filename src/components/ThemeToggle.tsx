import type { Theme } from "../hooks/useTheme";

type Props = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export default function ThemeToggle({ theme, onThemeChange }: Props) {
  const isDark = theme === "dark";
  
  const handleToggle = () => {
    onThemeChange(isDark ? "light" : "dark");
  };

  return (
    <button
      className="themeToggle"
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      role="switch"
      aria-checked={isDark}
    >
      <span className="themeToggleTrack">
        <span className="themeToggleThumb"></span>
      </span>
    </button>
  );
}
