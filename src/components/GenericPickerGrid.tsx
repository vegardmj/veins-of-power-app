// src/components/GenericPickerGrid.tsx
import React, { useMemo, useRef, useState } from "react";
import { InfoModal } from "./InfoModal";
import { Input, th, td } from "./UI";

export type ColumnDef<TRow> = {
  key: keyof TRow;
  header: string; // shown in header row (data columns only)
  width?: number;
  renderCell?: (
    row: TRow,
    setRow: (patch: Partial<TRow>) => void
  ) => React.ReactNode;
};

export type PickerFilter<TItem, TValue extends string = string> = {
  label: string;
  value: TValue;
  onChange: (v: TValue) => void;
  renderControl: (
    value: TValue,
    onChange: (v: TValue) => void
  ) => React.ReactNode;
  predicate: (item: TItem, value: TValue) => boolean;
};

export type GenericPickerGridProps<TItem, TRow> = {
  rows: TRow[];
  onChange: (rows: TRow[]) => void;

  columns: ColumnDef<TRow>[];

  catalogItems: TItem[];
  getItemLabel: (item: TItem) => string;
  getItemKey?: (item: TItem) => string;

  toRow: (item: TItem) => TRow;

  /** For Edit: map an existing row back to a catalog key (usually the Name field) */
  getRowCatalogKey?: (row: TRow) => string | null;

  titleAddModal?: string;
  addButtonLabel?: string;

  previewSections?: Array<{
    label: string;
    value: (item: TItem) => React.ReactNode;
  }>;
  filters?: Array<PickerFilter<TItem, string>>;

  /** Row key extractor (optional, otherwise uses index) */
  getRowKey?: (row: TRow, index: number) => React.Key;
};

// Inline pencil icon (no external libs)
const PencilIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      fill="currentColor"
    />
  </svg>
);

function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function GenericPickerGrid<TItem, TRow>({
  rows,
  onChange,
  columns,
  catalogItems,
  getItemLabel,
  getItemKey,
  toRow,
  getRowCatalogKey,
  titleAddModal = "Add",
  addButtonLabel = "+ Add",
  previewSections = [],
  filters = [],
  getRowKey,
}: GenericPickerGridProps<TItem, TRow>) {
  // ---- DnD
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const setRowAt = (idx: number, patch: Partial<TRow>) => {
    const copy = [...rows];
    // @ts-expect-error spread partial is fine
    copy[idx] = { ...(copy[idx] as any), ...patch };
    onChange(copy);
  };

  const onDragStart = (idx: number, e: React.DragEvent<HTMLSpanElement>) => {
    dragIndexRef.current = idx;
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (idx: number, e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overIndex !== idx) setOverIndex(idx);
  };
  const onDrop = (idx: number, e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    setOverIndex(null);
    dragIndexRef.current = null;
    if (from == null || from === idx) return;
    onChange(move(rows, from, idx));
  };
  const onDragEnd = () => {
    setOverIndex(null);
    dragIndexRef.current = null;
  };

  // ---- Modal (Add / Edit)
  type Mode = "add" | "edit";
  const [mode, setMode] = useState<Mode>("add");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = () => {
    setMode("add");
    setSelectedIdx(-1);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (rowIdx: number) => {
    setMode("edit");
    setEditIndex(rowIdx);

    // Preselect matching catalog item by key (row->key vs item->key)
    let targetKey: string | null = null;
    if (getRowCatalogKey) {
      targetKey = getRowCatalogKey(rows[rowIdx]);
    }
    const idxInFiltered = filteredItems.findIndex((it) => {
      const itemKey = (getItemKey?.(it) ?? getItemLabel(it)) || "";
      return itemKey === (targetKey ?? "");
    });

    setSelectedIdx(idxInFiltered >= 0 ? idxInFiltered : -1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
    setSelectedIdx(-1);
    setMode("add");
  };

  const saveModal = () => {
    if (selectedIdx < 0 || selectedIdx >= filteredItems.length) return;
    const item = filteredItems[selectedIdx];
    const newRow = toRow(item);

    if (mode === "add") {
      onChange([...(rows || []), newRow]);
    } else if (mode === "edit" && editIndex != null) {
      const copy = [...rows];
      copy[editIndex] = newRow;
      onChange(copy);
    }
    closeModal();
  };

  const deleteRow = () => {
    if (mode !== "edit" || editIndex == null) return;
    const copy = [...rows];
    copy.splice(editIndex, 1);
    onChange(copy);
    closeModal();
  };

  // ---- Filters -> filteredItems
  const filteredItems = useMemo(
    () =>
      catalogItems.filter((it) =>
        filters.every((f) => f.predicate(it, f.value))
      ),
    [catalogItems, filters]
  );

  const selectedItem =
    selectedIdx >= 0 && selectedIdx < filteredItems.length
      ? filteredItems[selectedIdx]
      : null;

  // ---- Header cells (build as array to avoid whitespace text nodes)
  const headerCells = useMemo(() => {
    const arr: React.ReactNode[] = [];
    arr.push(<th key="__drag" style={{ ...th, width: 4 }} />); // blank drag header
    for (const c of columns) {
      arr.push(
        <th
          key={String(c.key)}
          style={c.width ? { ...th, width: c.width } : th}
        >
          {c.header}
        </th>
      );
    }
    arr.push(<th key="__actions" style={{ ...th, width: 36 }} />); // blank actions header
    return arr;
  }, [columns]);

  return (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{headerCells}</tr>
        </thead>
        <tbody>
          {(rows || []).map((row, idx) => {
            const key = getRowKey?.(row, idx) ?? idx;

            // Build row cells as an array to avoid whitespace nodes
            const rowCells: React.ReactNode[] = [];

            // Drag handle
            rowCells.push(
              <td
                key="__drag"
                style={{ ...td, width: 28, paddingLeft: 6, paddingRight: 6 }}
              >
                <span
                  role="button"
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                  draggable
                  onDragStart={(e) => onDragStart(idx, e)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    cursor: "grab",
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>
                    ⠿
                  </span>
                </span>
              </td>
            );

            // Data cells
            for (const col of columns) {
              const setRow = (patch: Partial<TRow>) => setRowAt(idx, patch);
              if (col.renderCell) {
                rowCells.push(
                  <td key={String(col.key)} style={td}>
                    {col.renderCell(row, setRow)}
                  </td>
                );
              } else {
                const value = (row as any)[col.key] ?? "";
                rowCells.push(
                  <td key={String(col.key)} style={td}>
                    <Input
                      value={value}
                      onChange={(e) =>
                        setRow({ [col.key]: e.target.value } as Partial<TRow>)
                      }
                      style={col.width ? { maxWidth: col.width } : undefined}
                    />
                  </td>
                );
              }
            }

            // Actions (pencil)
            rowCells.push(
              <td
                key="__actions"
                style={{ ...td, width: 36, paddingLeft: 6, paddingRight: 6 }}
              >
                <button
                  type="button"
                  onClick={() => openEdit(idx)}
                  aria-label="Edit row"
                  title="Edit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "inline-flex" }}>
                    <PencilIcon />
                  </span>
                </button>
              </td>
            );

            return (
              <tr
                key={key}
                onDragOver={(e) => onDragOver(idx, e)}
                onDrop={(e) => onDrop(idx, e)}
                onDragEnd={onDragEnd}
                style={{
                  outline: overIndex === idx ? "2px dashed #aaa" : undefined,
                  background: overIndex === idx ? "#fafafa" : undefined,
                }}
              >
                {rowCells}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add button */}
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={openAdd}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          {addButtonLabel}
        </button>
      </div>

      {/* Shared Add/Edit modal */}
      <InfoModal
        open={modalOpen}
        title={mode === "add" ? titleAddModal : "Edit"}
        onClose={closeModal}
      >
        <div style={{ display: "grid", gap: 12 }}>
          {/* Filters */}
          {filters.length > 0 &&
            filters.map((f, i) => (
              <div key={i} style={{ display: "grid", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>
                  {f.label}
                </label>
                {f.renderControl(f.value, f.onChange)}
              </div>
            ))}

          {/* Picker */}
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            {mode === "add" ? "Select item" : "Select replacement"}
          </label>
          <select
            value={String(selectedIdx)}
            onChange={(e) => setSelectedIdx(parseInt(e.target.value, 10))}
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #ccc",
              maxWidth: 440,
            }}
          >
            <option value={-1}>— Choose —</option>
            {filteredItems.map((it, i) => {
              const label = getItemLabel(it);
              const key = getItemKey?.(it) ?? label;
              return (
                <option key={key} value={i}>
                  {label}
                </option>
              );
            })}
          </select>

          {/* Preview */}
          <div
            style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}
          >
            {selectedItem ? (
              <div style={{ display: "grid", gap: 8 }}>
                {previewSections.map((sec, i) => (
                  <div key={i}>
                    <div
                      style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}
                    >
                      {sec.label}
                    </div>
                    <div>{sec.value(selectedItem)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#777" }}>
                {mode === "add"
                  ? "Pick an item to preview details."
                  : "Pick a replacement to preview details."}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Delete in edit mode */}
            <div>
              {mode === "edit" && (
                <button
                  type="button"
                  onClick={deleteRow}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #c33",
                    background: "#ffeaea",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "#fafafa",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveModal}
                disabled={!selectedItem}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #4a7",
                  background: "#eaffea",
                  cursor: selectedItem ? "pointer" : "not-allowed",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </InfoModal>
    </>
  );
}
