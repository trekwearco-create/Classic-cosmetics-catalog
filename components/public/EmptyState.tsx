

export default function EmptyState({
  onClear,
  searchCount = 0,
}: {
  onClear: () => void;
  searchCount?: number;
}) {

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-bold" style={{ color: "var(--ink-2)" }}>
        No products found.
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
        {searchCount === 0
          ? "Try another word or clear the search."
          : "Try another word or choose another category."}
      </p>
      <button
        onClick={onClear}
        className="btn-primary mt-5"
        type="button"
      >
        Clear search
      </button>
    </div>
  );
}
