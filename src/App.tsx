import { useEffect, useState } from "react";
import { getItems, type Item } from "./api/client";

export default function App() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItems()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>My App</h1>
      <p>
        This is a static React app reading from JSON. Backend comes later ✨
      </p>

      {error && <div style={{ color: "crimson" }}>Error: {error}</div>}
      {!items && !error && <div>Loading…</div>}

      {items && (
        <ul
          style={{
            display: "grid",
            gap: "0.75rem",
            padding: 0,
            listStyle: "none",
          }}
        >
          {items.map((it) => (
            <li
              key={it.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "0.75rem",
              }}
            >
              <strong>{it.title}</strong>
              {it.details && (
                <p style={{ margin: "0.5rem 0 0" }}>{it.details}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
