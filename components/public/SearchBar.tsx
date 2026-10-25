"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SuggestionItem = {
  id: string;
  title: string;
  type: "product" | "category" | "brand";
  url: string;
};

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with URL params if changed externally
  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function fetchSuggestions(query: string) {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      })
      .catch(() => {
        setSuggestions([]);
        setIsOpen(false);
      });
  }

  function update(next: string) {
    setValue(next);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetchSuggestions(next);
      const sp = new URLSearchParams(params.toString());
      if (next.trim() === "") sp.delete("q");
      else sp.set("q", next.trim());
      sp.delete("page");
      router.replace(`/?${sp.toString()}`, { scroll: false });
    }, 250);
  }

  function handleSelect(item: SuggestionItem) {
    setIsOpen(false);
    setValue(item.title);
    router.push(item.url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsOpen(false);
    if (value.trim()) {
      router.push(`/?q=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        className="relative w-full"
        role="search"
        onSubmit={handleSubmit}
      >
        <input
          className="field !rounded-full w-full"
          style={{ paddingLeft: 44, paddingRight: 44 }}
          type="search"
          value={value}
          onChange={(e) => update(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
            else if (value.trim().length > 0) fetchSuggestions(value);
          }}
          placeholder="Search lipstick, shade, category"
          aria-label="Search products"
          autoComplete="off"
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
            onClick={() => {
              update("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-lg font-bold hover:bg-gray-100 transition-colors"
            style={{ color: "var(--ink-2)" }}
          >
            ×
          </button>
        ) : null}
      </form>

      {/* Predictive Multi-Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-[#0C3B25] flex items-center justify-between transition-colors"
            >
              <span className="font-medium truncate pr-2">{item.title}</span>
              <span className="text-[10px] text-gray-400 capitalize shrink-0 font-normal">
                {item.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
