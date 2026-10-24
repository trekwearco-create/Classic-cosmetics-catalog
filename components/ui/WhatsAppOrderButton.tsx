"use client";

import type { CartItem } from "@/components/public/CartProvider";

type WhatsAppOrderButtonProps = {
  productTitle?: string;
  shadeName?: string;
  price?: number | string;
  productUrl?: string;
  cartItems?: CartItem[];
  phoneNumber?: string;
  label?: string;
  className?: string;
};

export default function WhatsAppOrderButton({
  productTitle,
  shadeName,
  price,
  productUrl,
  cartItems,
  phoneNumber = "923222495034",
  label,
  className = "",
}: WhatsAppOrderButtonProps) {
  const handleOrder = () => {
    let msg = "";

    if (cartItems && cartItems.length > 0) {
      msg = `Hello Classic Cosmetics! 🌸\nI would like to order the following items from my cart:\n\n`;
      cartItems.forEach((item, index) => {
        msg += `${index + 1}. *${item.name}*\n`;
        if (item.shade) {
          msg += `   - Shade: ${item.shade.code ? `${item.shade.code} - ` : ""}${item.shade.name}\n`;
        }
        msg += `   - Qty: ${item.quantity}\n`;
      });
      msg += `\nPlease confirm total price, availability, and share payment details. Thank you!`;
    } else {
      msg = `Hello Classic Cosmetics! 🌸\nI want to order/inquire about this product:`;
      if (productTitle) msg += `\n• *Product:* ${productTitle}`;
      if (shadeName) msg += `\n• *Shade:* ${shadeName}`;
      if (price) msg += `\n• *Price:* PKR ${price}`;
      const url = productUrl || (typeof window !== "undefined" ? window.location.href : "");
      if (url) msg += `\n• *Link:* ${url}`;
      msg += `\n\nPlease confirm availability and share payment details. Thank you!`;
    }

    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const defaultLabel = cartItems && cartItems.length > 0 
    ? "ORDER ON WHATSAPP" 
    : "ORDER ON WHATSAPP";

  const buttonText = label || defaultLabel;

  return (
    <button
      onClick={handleOrder}
      type="button"
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-emerald-600 bg-gradient-to-r from-[#0C3B25] via-[#155d3a] to-[#0C3B25] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition-all duration-300 hover:shadow-emerald-900/40 hover:scale-[1.01] active:scale-[0.98] ${className}`}
    >
      {/* Animated shimmer sweep */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></span>

      <span className="relative z-10 flex items-center justify-center gap-2 font-serif tracking-widest text-white">
        <svg
          className="h-4 w-4 fill-current text-emerald-300 shrink-0 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
        <span>{buttonText}</span>
      </span>
    </button>
  );
}
