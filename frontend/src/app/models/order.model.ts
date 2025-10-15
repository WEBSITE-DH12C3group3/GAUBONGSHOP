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
  orderDate: string | null;              // giữ nguyên (FE đang dùng)
  status: OrderStatus;
  totalAmount: number;                   // giữ nguyên (FE đang dùng)
  items?: OrderItem[];

  itemsTotal: number;                    // giữ nguyên (đã có)
  shippingFee: number;                   // giữ nguyên (đã có)

  // ====== BỔ SUNG để khớp BE (chỉ thêm, không sửa cái cũ) ======
  shippingDiscount?: number;             // mới thêm
  grandTotal?: number;                   // mới thêm

  voucherCode?: string;                  // mới thêm

  receiverName?: string;                 // mới thêm
  phone?: string;                        // mới thêm
  addressLine?: string;                  // mới thêm
  province?: string;                     // mới thêm
  weightKg?: number;                     // mới thêm

  createdAt?: string;                    // BE trả LocalDateTime -> FE dùng string  ISO
  shipping?: {                           // mới thêm (khớp nested record Shipping)
    carrier: string;
    trackingCode: string | null;
    status: string;
    feeCharged: number;
  };

  couponCode?: string | null;            // mới thêm
  couponDiscount?: number;               // mới thêm
  // =============================================================
}
