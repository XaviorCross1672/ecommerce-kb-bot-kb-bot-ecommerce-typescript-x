export type Order = { status: "paid" | "packed" | "shipped" | "delivered"; tracking?: string };

export function orderReply(order: Order): string {
  if (order.status === "shipped") return order.tracking ? `Your order is on the way. Tracking: ${order.tracking}.` : "Your order is on the way.";
  if (order.status === "delivered") return "Your order was delivered. Check the receipt email for the itemized total.";
  if (order.status === "packed") return "Your order is packed and will ship soon.";
  return "Your payment is confirmed and fulfillment is preparing the order.";
}
