const SIZES = [96, 64, 80, 56, 72, 88, 60, 76];

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card overflow-hidden"
          aria-hidden="true"
        >
          <div className="skeleton aspect-square w-full" style={{ borderRadius: 0 }} />
          <div className="p-3">
            <div className="skeleton mb-2 h-3" style={{ width: `${(SIZES[i % SIZES.length] ?? 60)}px` }} />
            <div className="skeleton mb-2 h-3.5 w-full" />
            <div className="skeleton h-3.5" style={{ width: "60%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
