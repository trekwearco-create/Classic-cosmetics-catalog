import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card text-center">
        <p className="text-sm font-bold" style={{ color: "rgba(0,0,0,.68)" }}>
          Product no longer available
        </p>
        <p className="mt-2 text-sm" style={{ color: "rgba(0,0,0,.68)" }}>
          It may have been moved or hidden by the owner.
        </p>
        <Link href="/" className="btn-secondary mt-5">
          Back to the catalog
        </Link>
      </div>
    </main>
  );
}
