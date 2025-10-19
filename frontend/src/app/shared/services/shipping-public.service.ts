import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
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

/** Trả về khi gọi /api/client/orders/preview-shipping (map theo DB) */
export interface PreviewShippingResponse {
  carrier: string;                 // ví dụ: 'INTERNAL'
  service?: string | null;         // 'Tiêu chuẩn' (optional)
  distanceKm?: number | null;

  // map theo DB
  shippingFeeBefore?: number | null;   // shipping_fee_before
  shippingDiscount?: number | null;    // shipping_discount
  shippingFeeFinal: number;            // shipping_fee_final
  voucherCode?: string | null;         // voucher_code

  // ETA theo DB
  etaMin?: number | null;              // shipping_eta_min
  etaMax?: number | null;              // shipping_eta_max

  // fallback nếu BE trả 1 số chung
  etaDays?: number | null;
}

/** Khi cần dùng /api/public/shipping/quotes (nếu sau này bạn mở nhiều phương án) */
export interface ShippingQuote {
  carrier: string;
  service?: string | null;
  distanceKm?: number | null;
  shippingFeeBefore?: number | null;
  shippingDiscount?: number | null;
  shippingFeeFinal: number;
  voucherCode?: string | null;
  etaMin?: number | null;
  etaMax?: number | null;
  etaDays?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ShippingPublicService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Dùng khi bạn muốn lấy danh sách quote công khai (không auth) + chuẩn hoá field */
  quote(req: ShippingQuoteRequest): Observable<ShippingQuote> {
    const payload = this.normalizeRequest(req);
    return this.http.post<any>(`${this.API}/public/shipping/quotes`, payload).pipe(
      map(raw => this.normalizeQuote(raw, payload.voucherCode as string | undefined))
    );
  }

  /** Dùng trong checkout: preview 1 phương án theo rule hiện tại (cần auth) + chuẩn hoá field */
  previewShipping(req: ShippingQuoteRequest): Observable<PreviewShippingResponse> {
    const payload = this.normalizeRequest(req);
    return this.http.post<any>(`${this.API}/client/orders/preview-shipping`, payload).pipe(
      map(raw => this.normalizeQuote(raw, payload.voucherCode as string | undefined))
    );
  }

  // ===== Helpers =====

  /** Trim voucherCode; nếu rỗng/null thì bỏ khỏi payload để tránh BE hiểu nhầm */
  private normalizeRequest(req: ShippingQuoteRequest): ShippingQuoteRequest {
    const v = (req.voucherCode ?? '').toString().trim();
    const voucher = v ? v : undefined;
    return {
      ...req,
      voucherCode: voucher,
      carrierCode: req.carrierCode ?? undefined,
      serviceCode: req.serviceCode ?? undefined,
      province: req.province ?? undefined,
    };
  }

  /** Chuẩn hoá object phản hồi từ BE sang shape thống nhất cho UI */
  private normalizeQuote(raw: any, sentVoucher?: string) {
    // carrier/service
    const carrier = raw?.carrier ?? raw?.provider ?? 'INTERNAL';
    const service = raw?.service ?? raw?.serviceCode ?? null;

    // khoảng cách
    const distanceKm = raw?.distanceKm ?? raw?.km ?? null;

    // phí gốc trước ưu đãi (ưu tiên tên theo DB)
    const base = num(
      raw?.shippingFeeBefore ??
      raw?.feeBeforeDiscount ??
      raw?.baseFee ??
      raw?.feeBeforeVoucher ??
      raw?.originalFee ??
      raw?.fee ??           // một số BE trả 'fee' là base
      raw?.totalFee ??      // hoặc totalFee là base trước giảm
      0
    );

    // phí sau ưu đãi
    const fin = num(
      raw?.shippingFeeFinal ??
      raw?.finalFee ??
      raw?.feeAfterVoucher ??
      raw?.totalFee ??      // có BE dùng totalFee là phí cuối
      raw?.fee ??           // hoặc fee là phí cuối
      base
    );

    // mức giảm
    const discount = (raw?.shippingDiscount != null)
      ? num(raw?.shippingDiscount)
      : Math.max(0, base - fin);

    // voucher áp dụng
    const voucherCode = raw?.voucherCode ?? raw?.appliedVoucher ?? sentVoucher ?? null;

    // ETA: hỗ trợ nhiều biến thể → map về etaMin/etaMax/etaDays
    const etaMin = firstNum(raw?.etaMin, raw?.shipping_eta_min, raw?.etaDaysMin);
    const etaMax = firstNum(raw?.etaMax, raw?.shipping_eta_max, raw?.etaDaysMax);
    const etaDays = firstNum(raw?.etaDays, raw?.eta);

    const normalized = {
      carrier,
      service,
      distanceKm,
      shippingFeeBefore: base,
      shippingDiscount: discount,
      shippingFeeFinal: fin,
      voucherCode,
      etaMin: etaMin ?? null,
      etaMax: etaMax ?? null,
      etaDays: etaDays ?? null,
    };

    return normalized as PreviewShippingResponse;
  }
}

/** số an toàn */
function num(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** lấy số đầu tiên khác null/undefined */
function firstNum(...vals: any[]): number | undefined {
  for (const v of vals) {
    if (v === 0 || (v != null && Number.isFinite(Number(v)))) return Number(v);
  }
  return undefined;
}
