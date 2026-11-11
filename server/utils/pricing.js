// Seat tiers multiply the show's base price. Kept server-side so the client can never set the price.
export const CATEGORY_MULTIPLIER = { Regular: 1, Premium: 1.25, Recliner: 1.6 };

export const priceFor = (basePrice, category) => Math.round(basePrice * (CATEGORY_MULTIPLIER[category] ?? 1));

export const categoryPrices = (basePrice) =>
  Object.fromEntries(Object.keys(CATEGORY_MULTIPLIER).map((c) => [c, priceFor(basePrice, c)]));

export const totalFor = (basePrice, seats) => seats.reduce((sum, seat) => sum + priceFor(basePrice, seat.category), 0);
