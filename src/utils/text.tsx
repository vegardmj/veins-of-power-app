import React from "react";

export function lines(s: string | undefined) {
  if (!s) return null;
  const parts = s.split("\n");
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
}
