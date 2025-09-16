export interface ShipVoucher {
  id: number;
  code: string;
  description?: string;

  discountType: 'free' | 'percent' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number | null;

  minOrderAmount?: number | null;
  minShippingFee?: number | null;

  applicableCarriers?: string | null; // CSV: "GHTK,Viettel Post"
  regionInclude?: string | null;      // CSV
  regionExclude?: string | null;      // CSV

  maxUses?: number | null;
  usedCount?: number;
  maxUsesPerUser?: number | null;

  startDate?: string | null; // ISO
  endDate?: string | null;   // ISO

  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShipVoucherResponse {
  items: ShipVoucher[];
  page: number;
  size: number;
  totalPages: number;
  total?: number;
}
