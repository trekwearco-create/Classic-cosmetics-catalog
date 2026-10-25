export default function LoadingSpinner() {
  return (
    <div className="bg-white/80 backdrop-blur-sm fixed inset-0 z-50 flex flex-col items-center justify-center">
      <div className="border-2 border-emerald-100 border-t-[#0C3B25] rounded-full h-12 w-12 animate-spin" />
      <p className="mt-4 font-serif text-xs tracking-[0.25em] uppercase text-[#0C3B25] animate-pulse">
        Classic Cosmetics
      </p>
    </div>
  );
}
