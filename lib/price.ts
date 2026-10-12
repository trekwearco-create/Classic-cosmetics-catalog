export const effectivePrice = (p: {
  price: number;
  discount_price: number | null;
}) => p.discount_price ?? p.price;

export const discountPercent = (p: {
  price: number;
  discount_price: number | null;
}) =>
  p.discount_price !== null && p.discount_price < p.price
    ? Math.round(((p.price - p.discount_price) / p.price) * 100)
    : 0;

export function formatMoney(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const needsDecimals = rounded % 1 !== 0;
  return `Rs. ${rounded.toLocaleString("en-US", {
    minimumFractionDigits: needsDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
