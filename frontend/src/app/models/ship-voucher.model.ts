// Kiểu dữ liệu cho voucher vận chuyển – khớp backend đã chuẩn hoá
export type DiscountType = 'free' | 'percent' | 'fixed';

export interface ShipVoucher {
  id?: number;
  code: string;
  description?: string | null;

  discountType: DiscountType;     // chuỗi enum từ BE
  discountValue?: number | null;  // % hoặc VND
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;

  startAt?: string | null;        // đổi từ startDate -> startAt
  endAt?: string | null;          // đổi từ endDate  -> endAt

  usageLimit?: number | null;
  usedCount?: number | null;

  active?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// Response cho màn danh sách (phân trang)
export interface ShipVoucherResponse {
  items: ShipVoucher[];
  page: number;
  size: number;
  totalPages: number;
  total: number;   // tổng phần tử
}
