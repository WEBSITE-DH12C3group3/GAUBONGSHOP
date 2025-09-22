export interface ShippingRate {
  id?: number;
  carrier: string;            // GHN / GHTK / INTERNAL...
  baseFee: number;            // VND
  feePerKg: number;           // VND/kg
  freeThreshold?: number | null; // đạt ngưỡng này thì free ship
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Phản hồi phân trang chung (Spring Data)
export interface PageResp<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
