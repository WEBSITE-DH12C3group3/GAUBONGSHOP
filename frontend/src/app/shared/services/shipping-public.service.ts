import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Request báo giá/preview phí ship — khớp backend:
 * - orderSubtotal: tổng tiền hàng
 * - weightKg: tổng khối lượng
 * - destLat/destLng: toạ độ người nhận
 * - voucherCode: mã freeship (optional)
 * - carrierCode/serviceCode: để mở rộng (optional)
 */
export interface ShippingQuoteRequest {
  orderSubtotal: number;
  weightKg: number;
  destLat: number;
  province?: string;      // fallback
  destLng: number;
  voucherCode?: string | null;
  carrierCode?: string | null;
  serviceCode?: string | null;
}

/** Trả về khi gọi /api/client/orders/preview-shipping */
export interface PreviewShippingResponse {
  carrier: string;                // ví dụ: 'INTERNAL'
  service?: string | null;        // 'Tiêu chuẩn' (optional)
  distanceKm?: number | null;
  feeBeforeDiscount?: number | null;
  discount?: number | null;
  finalFee: number;
  appliedVoucher?: string | null;

    etaMin?: number;
  etaMax?: number;
  etaDays?: number;
}

/** Khi cần dùng /api/public/shipping/quotes (nếu sau này bạn mở nhiều phương án) */
export interface ShippingQuote {
  carrier: string;
  service?: string | null;
  distanceKm?: number | null;
  feeBeforeDiscount?: number | null;
  discount?: number | null;
  finalFee: number;
  appliedVoucher?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ShippingPublicService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Dùng khi bạn muốn lấy danh sách quote công khai (không auth) */
  quote(req: ShippingQuoteRequest): Observable<ShippingQuote> {
    return this.http.post<ShippingQuote>(`${this.API}/public/shipping/quotes`, req);
  }

  /** Dùng trong checkout: preview 1 phương án theo rule hiện tại (cần auth) */
  previewShipping(req: ShippingQuoteRequest): Observable<PreviewShippingResponse> {
    return this.http.post<PreviewShippingResponse>(`${this.API}/client/orders/preview-shipping`, req);
  }
}
