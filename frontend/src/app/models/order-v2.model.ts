export type OrderStatus =
  | 'PENDING_PAYMENT' | 'PAID' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // page index
}

export interface OrderListItemDto {
  id: number;
  status: OrderStatus;
  itemsTotal: number;
  shippingFee: number;
  shippingDiscount: number;
  grandTotal: number;
  receiverName: string;
  phone: string;
  addressLine: string;
  province: string;
  orderDate: string; // ISO
}

export interface ItemDto {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  weightKgPerItem: number;
}

export interface ShippingDto {
  carrier: string | null;
  service: string | null;
  trackingCode: string | null;
  status: string | null;
  etaDaysMin: number | null;
  etaDaysMax: number | null;
  distanceKm: number | null;
  feeBeforeDiscount: number | null;
  discount: number | null;
  finalFee: number | null;
}

export interface OrderDetailDto extends OrderListItemDto {
  userId: number;
  voucherCode: string | null;
  weightKg: number | null;
  shipping: ShippingDto;
  items: ItemDto[];
}
