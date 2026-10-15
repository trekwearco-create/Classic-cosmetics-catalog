import CartPage from "@/components/public/CartPage";
import { env } from "@/lib/env";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

export default function CartRoute() {
  const config = env();
  return (
    <CartPage
      whatsappNumber={normalizeWhatsAppNumber(config.WHATSAPP_NUMBER)}
      siteUrl={config.SITE_URL}
    />
  );
}
