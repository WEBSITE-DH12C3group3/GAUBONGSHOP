export interface CheckoutCartItem {
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CheckoutCartSnapshot {
  items: CheckoutCartItem[];
  totalQuantity: number;
  totalAmount: number;
  selectedItems?: CheckoutCartItem[]; // nếu bạn có chọn trong giỏ
  selectedAmount?: number;
  // có thể bổ sung cartHash nếu BE cần
}

export interface UserAddressInput {
  receiverName: string;
  phone: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  addressLine: string;
  lat?: number | null;
  lng?: number | null;
  isDefault?: boolean;
}

export type PaymentMethod = 'COD' | 'e_wallet' | 'bank_transfer' | 'credit_card';

export interface ShippingQuoteRequest {
  address: UserAddressInput;
  itemsTotal: number;          // tiền hàng
  weightGram: number;          // (tạm tính) -> có thể ước lượng theo số sp
  distanceKm?: number | null;  // để BE tự tính nếu null
  cod: boolean;                // nếu phương thức COD
}

export interface ShippingQuote {
  carrierCode: string;
  carrierName: string;
  serviceId: number;
  serviceCode: string;
  serviceLabel: string;
  fee: number;
  etaMin: number;
  etaMax: number;
  feeBeforeVoucher?: number;
  voucherApplied?: string | null;
  reasonIfRejected?: string | null;
  breakdown?: any;
}

export interface ShippingVoucherPreviewRequest {
  voucherCode: string;
  quote: ShippingQuote; // hoặc: { carrier/service/fee/eta ... }
}

export interface ShippingVoucherPreview {
  ok: boolean;
  discountedFee: number;
  discountAmount: number;
  reason?: string;
}

export interface CreateOrderRequest {
  items: Array<{ productId: number; quantity: number; price: number }>;
  address: UserAddressInput;
  paymentMethod: PaymentMethod;
  shippingSelection: {
    carrierCode: string;
    serviceId: number;
    serviceCode: string;
    voucherCode?: string | null;
  };
  note?: string | null;
}

export interface CreateOrderResponse {
  id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingFeeFinal: number;
  totalAmount: number;
  // ...các field khác BE trả về
}
