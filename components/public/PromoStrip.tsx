/**
 * PromoStrip — thin announcement banner above the header.
 * Static for now; will pull from site_settings in Phase 7.
 */
export default function PromoStrip() {
  return (
    <div className="promo-strip" role="complementary" aria-label="Promotion">
      <p>
        🚚 Free shipping on orders over PKR 999 &nbsp;·&nbsp; Use code{" "}
        <strong>WELCOME10</strong> for 10% off your first order
      </p>
    </div>
  );
}
