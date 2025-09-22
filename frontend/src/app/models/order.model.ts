export type OrderStatus = 'pending'|'processing'|'shipped'|'delivered'|'cancelled';

export interface OrderItem {
  productId: number | null;
  productName?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  id: number;
  orderDate: string | null;
  status: OrderStatus;
  totalAmount: number;
  items?: OrderItem[];
}
