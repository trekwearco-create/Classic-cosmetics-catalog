import { ProductGridSkeleton } from "@/components/public/Skeletons";

export default function PublicLoading() {
  return (
    <main className="mt-6 flex flex-col gap-8" aria-label="Loading catalog">
      <div className="skeleton h-12 w-full" />
      <div>
        <div className="skeleton mb-4 h-7 w-48" />
        <div className="grid grid-cols-4 gap-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton aspect-square rounded-full" />
          ))}
        </div>
      </div>
      <ProductGridSkeleton />
    </main>
  );
}
