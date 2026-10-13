"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function update(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (next.trim() === "") sp.delete("q");
      else sp.set("q", next.trim());
      sp.delete("page");
      router.replace(`/?${sp.toString()}`, { scroll: false });
    }, 300);
  }

  return (
    <form
      className="relative"
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        className="field !rounded-full"
        style={{ paddingLeft: 44, paddingRight: 44 }}
        type="search"
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder="Search lipstick, shade, category"
        aria-label="Search products"
      />
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
      >
        <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#1A1814" strokeWidth="2" />
        <path d="M15.5 15.5L21 21" stroke="#1A1814" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {value !== "" ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => update("")}
          className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-lg font-bold"
          style={{ color: "var(--ink-2)" }}
        >
          ×
        </button>
      ) : null}
    </form>
  );
}
