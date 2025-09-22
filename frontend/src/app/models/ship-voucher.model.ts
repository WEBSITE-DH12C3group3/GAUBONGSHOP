// Kiểu dữ liệu cho voucher vận chuyển – khớp backend đã chuẩn hoá
export type DiscountType = 'free' | 'percent' | 'fixed';

export interface ShipVoucher {
  id?: number;
  code: string;
  description?: string;

  discountType: DiscountType;
  discountValue: number;                // % với 'percent', VND với 'fixed', bỏ qua với 'free'
  maxDiscountAmount?: number | null;    // trần giảm VND
  minOrderAmount?: number | null;       // tối thiểu giá trị đơn để dùng

  // Thời gian hiệu lực
  startDate?: string | null;            // frontend dùng camelCase; backend có thể là startAt
  endDate?: string | null;

  // Hạn mức sử dụng
  maxUses?: number | null;              // tổng lượt được phép dùng (backend: usageLimit)
  usedCount?: number;                   // đã dùng
  maxUsesPerUser?: number | null;       // nếu có (backend có thể bỏ qua)

  // Điều kiện mở rộng (tùy bạn có dùng hay không; để optional cho dễ tương thích)
  minShippingFee?: number | null;
  applicableCarriers?: string[] | null; // ['GHN','GHTK']...
  regionInclude?: string[] | null;
  regionExclude?: string[] | null;

  active: boolean;
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
