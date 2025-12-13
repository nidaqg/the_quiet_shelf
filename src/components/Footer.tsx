import React from "react";

type FooterProps = {
  message?: React.ReactNode;
};

export default function Footer({ message }: FooterProps) {
  return (
    <footer className="footer">
      <span>
        {message}
      </span>
        <span className="version">v1.0.0</span>
    </footer>
  );
}
