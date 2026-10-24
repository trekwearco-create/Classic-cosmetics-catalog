"use client";


export default function WhatsAppOrderButton({
  productTitle,
  shadeName,
  price,
  phoneNumber = "923222495034",
  label = "Order on WhatsApp",
}: {
  productTitle?: string;
  shadeName?: string;
  price?: number | string;
  phoneNumber?: string;
  label?: string;
}) {
  const handleOrder = () => {
    let msg = `Hello Classic Cosmetics! I want to order/inquire:`;
    if (productTitle) msg += `\n- Product: ${productTitle}`;
    if (shadeName) msg += `\n- Shade: ${shadeName}`;
    if (price) msg += `\n- Price: PKR ${price}`;
    msg += `\nPlease share payment details and confirm my order.`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <button
      onClick={handleOrder}
      type="button"
      id="whatsapp-order-btn"
      className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full border border-emerald-700 bg-gradient-to-r from-[#0C3B25] via-[#14532d] to-[#0C3B25] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-md transition-all duration-300 hover:shadow-emerald-900/30 active:scale-[0.98]"
    >
      {/* Shimmer sweep */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></span>
      <span className="relative z-10 flex items-center gap-2.5 font-serif text-white">
        <svg
          className="h-4 w-4 fill-current text-emerald-300 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
        {label}
      </span>
    </button>
  );
}
