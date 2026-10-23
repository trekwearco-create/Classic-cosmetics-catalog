"use client";
import { useEffect, useState } from "react";

export default function Loader({ fullScreen = true, text = "Classic Cosmetics" }: { fullScreen?: boolean; text?: string }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 600);
    const unmountTimer = setTimeout(() => setMounted(true), 900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (mounted) return null;

  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 z-[9999]" : "w-full py-12"
      } flex flex-col items-center justify-center bg-white transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-emerald-300 animate-[ping_1.6s_cubic-bezier(0,0,0.2,1)_infinite] opacity-60"></div>
        <div className="w-16 h-16 rounded-full border-2 border-emerald-100"></div>
        <div className="absolute w-16 h-16 rounded-full border-[2.5px] border-transparent border-t-[#0c3b25] border-r-[#0c3b25] animate-[spin_1.6s_linear_infinite]"></div>
        <div className="w-2 h-2 rounded-full bg-[#0c3b25]"></div>
      </div>
      {text && (
        <p className="mt-6 font-serif text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0c3b25]">
          {text}
        </p>
      )}
    </div>
  );
}
