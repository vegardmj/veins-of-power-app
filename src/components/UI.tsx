import React from "react";

export const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section style={{ margin: "1.25rem 0" }}>
    <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{title}</h2>
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: "0.9rem",
        marginTop: "0.5rem",
      }}
    >
      {children}
    </div>
  </section>
);

export const Row: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 16,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(12, 1fr)",
      gap,
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

export const Col: React.FC<{ span?: number; children: React.ReactNode }> = ({
  span = 6,
  children,
}) => <div style={{ gridColumn: `span ${span}` }}>{children}</div>;

/** Auto-wrapping grid: each item gets at least minWidth, and wraps as needed */
export const AutoGrid: React.FC<{
  min?: number;
  gap?: number;
  children: React.ReactNode;
}> = ({ min = 220, gap = 12, children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
      gap,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{ fontSize: 12, fontWeight: 600, opacity: 0.85, marginBottom: 4 }}
  >
    {children}
  </div>
);

// NOTE: merge user styles LAST so callers can override width/spacing per control
export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const { style, ...rest } = props;
  const base: React.CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid #ccc",
    outline: "none",
    minWidth: 0,
  };
  return <input {...rest} style={{ ...base, ...style }} />;
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (
  props
) => {
  const { style, ...rest } = props;
  const base: React.CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid #ccc",
    minWidth: 0,
  };
  return <select {...rest} style={{ ...base, ...style }} />;
};

export const Textarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = (props) => {
  const { style, ...rest } = props;
  const base: React.CSSProperties = {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ccc",
    minHeight: 90,
  };
  return <textarea {...rest} style={{ ...base, ...style }} />;
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...rest }) => (
  <button
    {...rest}
    style={{
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid #bbb",
      background: "#f7f7f7",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

export const th: React.CSSProperties = {
  textAlign: "left",
  padding: "6px 8px",
  borderBottom: "1px solid #ddd",
  fontSize: 13,
  fontWeight: 700,
};
export const tdHead: React.CSSProperties = {
  padding: "4px 8px",
  borderBottom: "1px solid #eee",
  fontWeight: 600,
  background: "#fafafa",
  width: 120,
};
export const td: React.CSSProperties = {
  padding: "4px 12px",
  borderBottom: "1px solid #eee",
};
