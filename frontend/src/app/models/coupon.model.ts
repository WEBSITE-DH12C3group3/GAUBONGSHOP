export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usedCount?: number;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponResponse {
  items: Coupon[];
  page: number;
  size: number;
  totalPages: number;
  total?: number;
}
