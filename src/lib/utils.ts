export function calculateSellerFee(price: number, quantity: number): number {
  return (price * 0.05) + (10 * quantity);
}

export function calculateSupplierFee(price: number, quantity: number): number {
  return (price * 0.05) + (10 * quantity);
}

export function calculateProfit(price: number, costPrice: number, quantity: number): number {
  return (price * quantity) - (costPrice * quantity);
}

export function calculateDeliveryFee(zone: string): number {
  if (zone === "Zone A") return 20;
  if (zone === "Zone B") return 40;
  return 100;
}

export function convertCurrency(amount: number, rate: number): number {
  return amount * rate;
}
