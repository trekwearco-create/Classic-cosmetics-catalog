"use client";
import { useState, type MouseEvent, type ReactNode } from "react";

export default function CosmeticsButton({
  children = "Add to Cart",
  onClick,
  disabled = false,
  className = "",
  type = "button",
}: {
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      if (onClick) await onClick(e);
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#0c3b25] px-8 py-3.5 text-xs font-medium uppercase tracking-[0.22em] transition-all duration-300 ease-out ${
        loading
          ? "bg-white text-transparent cursor-not-allowed shadow-none"
          : "bg-[#0c3b25] text-white hover:bg-white hover:text-[#0c3b25] shadow-sm active:scale-[0.98]"
      } ${className}`}
    >
      <span className="absolute inset-0 h-full w-full bg-white transition-transform duration-300 ease-out -translate-y-full group-hover:translate-y-0 -z-0"></span>
      <span className="relative z-10 font-serif transition-colors duration-300">{children}</span>
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white">
          <div className="relative flex h-5 w-5 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-emerald-300 animate-[ping_1.0s_cubic-bezier(0,0,0.2,1)_infinite] opacity-60"></div>
            <div className="h-5 w-5 rounded-full border border-emerald-100"></div>
            <div className="absolute h-5 w-5 rounded-full border-[1.5px] border-transparent border-t-[#0c3b25] border-r-[#0c3b25] animate-[spin_1.0s_linear_infinite]"></div>
            <div className="h-1 w-1 rounded-full bg-[#0c3b25]"></div>
          </div>
        </div>
      )}
    </button>
  );
}
