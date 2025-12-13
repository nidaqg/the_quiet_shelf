import React from "react";

type FooterProps = {
  message?: string;
};

export default function Footer({ message }: FooterProps) {
  return (
    <footer className="footer">
      <span>
        {message || "Tip: log a quick session each day to power the heatmap + monthly covers."}
      </span>
        <span className="version">v1.0.0</span>
    </footer>
  );
}
