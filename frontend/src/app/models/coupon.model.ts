export interface Coupon {
  id: number;
  code: string;
  description?: string;

  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number | null;

  minOrderAmount?: number | null;
  excludeDiscountedItems: boolean;

  applicablePaymentMethods?: string | null; // CSV
  applicableRoles?: string | null;          // CSV
  regionInclude?: string | null;
  regionExclude?: string | null;

  firstOrderOnly: boolean;
  stackable: boolean;

  maxUses?: number | null;
  usedCount: number;
  maxUsesPerUser?: number | null;

  startDate?: string | null;
  endDate?: string | null;
  active: boolean;

  createdAt?: string;
  updatedAt?: string;

  categoryIds?: number[];
  brandIds?: number[];
  productIds?: number[];
}

export interface CouponResponse {
  items: Coupon[];
  page: number;
  size: number;
  totalPages: number;
  total?: number;
}
