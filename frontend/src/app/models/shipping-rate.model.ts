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

export interface CarrierRateRule {
  id?: number;
  serviceId: number;      // FK -> shipping_services.id
  minKm: number;          // null/0 = từ 0
  maxKm?: number | null;  // null = vô cực
  baseFee: number;        // VND
  perKmFee: number;       // VND/km
  freeKm?: number | null; // miễn phí km đầu
  minFee?: number | null; // sàn thu
  active: boolean;
  activeFrom?: string | null;
  activeTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

