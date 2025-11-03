import React from "react";

export function InfoModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    // No overlay/scrim—just the fixed right-side panel
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "30vw", // 30% of screen width
        minWidth: 300, // optional: keep usable on small screens
        maxWidth: 560, // optional: cap on ultrawide screens
        height: "100vh", // full screen height
        background: "white",
        overflow: "auto",
        borderLeft: "1px solid #eee",
        boxShadow: "-2px 0 30px rgba(0,0,0,.25)",
        zIndex: 9999, // sits above page but doesn't block it elsewhere
      }}
      role="region"
      aria-label={title}
      // No onClick handler here—clicks outside won't close it
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          zIndex: 1,
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button
          onClick={onClose}
          style={{
            border: "1px solid #ddd",
            background: "#fafafa",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>

      <div style={{ padding: "12px 16px" }}>{children}</div>
    </div>
  );
}
