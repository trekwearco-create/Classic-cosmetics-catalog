"use client";

import { useState } from "react";

export type ShadeRow = {
  key: string;
  code: string;
  name: string;
  color_hex: string;
  is_available: boolean;
};

export function parseBulkShades(text: string): ShadeRow[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 300)
    .map((line, i) => {
      const parts = line.split(/\s+/);
      const looksLikeCode = /^\d{1,4}[-/]?\d*[A-Za-z]?$/.test(parts[0] ?? "");
      if (looksLikeCode && parts.length > 1) {
        return {
          key: `bulk-${i}-${Math.random().toString(36).slice(2, 7)}`,
          code: parts[0] ?? "",
          name: parts.slice(1).join(" "),
          color_hex: "",
          is_available: true,
        };
      }
      return {
        key: `bulk-${i}-${Math.random().toString(36).slice(2, 7)}`,
        code: "",
        name: parts.join(" "),
        color_hex: "",
        is_available: true,
      };
    });
}

export default function ShadeEditor({
  shades,
  onChange,
}: {
  shades: ShadeRow[];
  onChange: (rows: ShadeRow[]) => void;
}) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  function update(index: number, patch: Partial<ShadeRow>) {
    onChange(shades.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= shades.length) return;
    const next = [...shades];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onChange(next);
  }

  function add() {
    onChange([
      ...shades,
      {
        key: `shade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        code: "",
        name: "",
        color_hex: "",
        is_available: true,
      },
    ]);
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {shades.map((shade, i) => (
          <div
            key={shade.key}
            className="flex flex-wrap items-center gap-2 rounded-xl border p-2"
            style={{ borderColor: "var(--line)", background: "var(--white)" }}
          >
            <input
              type="color"
              aria-label="Shade colour"
              value={shade.color_hex === "" ? "#ffffff" : shade.color_hex}
              onChange={(e) => update(i, { color_hex: e.target.value.toUpperCase() })}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-full border"
              style={{ borderColor: "var(--line)" }}
            />
            <input
              className="field !min-h-[40px] w-20 flex-none"
              value={shade.code}
              onChange={(e) => update(i, { code: e.target.value.slice(0, 20) })}
              placeholder="Code"
              aria-label="Shade code"
            />
            <input
              className="field !min-h-[40px] min-w-0 flex-1"
              value={shade.name}
              onChange={(e) => update(i, { name: e.target.value.slice(0, 60) })}
              placeholder="Shade name"
              aria-label="Shade name"
              required
            />
            <label className="flex flex-none items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={shade.is_available}
                onChange={(e) => update(i, { is_available: e.target.checked })}
                className="h-5 w-5 accent-black"
              />
              {shade.is_available ? "Available" : "Unavailable"}
            </label>
            <div className="flex flex-none items-center gap-1">
              <button
                type="button"
                aria-label="Move shade earlier"
                onClick={() => move(i, -1)}
                className="rounded px-2 py-1.5 text-xs font-bold"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Delete shade"
                onClick={() => onChange(shades.filter((_, j) => j !== i))}
                className="rounded px-2 py-1.5 text-xs font-bold"
                style={{ color: "var(--rose)" }}
              >
                ✕
              </button>
              <button
                type="button"
                aria-label="Move shade later"
                onClick={() => move(i, 1)}
                className="rounded px-2 py-1.5 text-xs font-bold"
              >
                →
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-secondary !min-h-[44px] !px-4 text-sm" type="button" onClick={add}>
          Add shade
        </button>
        <button
          className="btn-secondary !min-h-[44px] !px-4 text-sm"
          type="button"
          onClick={() => setBulkOpen((v) => !v)}
        >
          Paste a list
        </button>
      </div>
      {bulkOpen ? (
        <div className="mt-2 rounded-xl border p-3" style={{ borderColor: "var(--line)" }}>
          <textarea
            className="field h-32 w-full py-2"
            placeholder={"201 Fiesta\n203 Real Red\n208 Terracotta"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value.slice(0, 6000))}
          />
          <p className="mt-1 text-xs" style={{ color: "rgba(0,0,0,.68)" }}>
            One shade per line, for example 201 Fiesta. A single word becomes the name.
          </p>
          {bulkText.trim() !== "" ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {parseBulkShades(bulkText)
                .slice(0, 8)
                .map((s) => (
                  <span
                    key={s.key}
                    className="rounded-full border px-3 py-1 text-sm"
                    style={{ borderColor: "var(--line)" }}
                  >
                    {s.code ? `${s.code} ` : ""}
                    {s.name}
                  </span>
                ))}
              {parseBulkShades(bulkText).length > 8 ? (
                <span className="text-sm" style={{ color: "rgba(0,0,0,.68)" }}>
                  and {parseBulkShades(bulkText).length - 8} more
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="mt-3 flex gap-2">
            <button
              className="btn-primary !min-h-[44px] !px-4 text-sm"
              type="button"
              onClick={() => {
                const parsed = parseBulkShades(bulkText);
                onChange([...shades, ...parsed]);
                setBulkText("");
                setBulkOpen(false);
              }}
            >
              Add these shades
            </button>
            <button
              className="btn-secondary !min-h-[44px] !px-4 text-sm"
              type="button"
              onClick={() => setBulkOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
