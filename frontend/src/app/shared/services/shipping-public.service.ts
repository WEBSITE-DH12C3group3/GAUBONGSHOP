import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ShippingQuoteRequest {
  orderSubtotal: number; // VND
  weightKg: number;      // kg
  province?: string;
  voucherCode?: string | null;
  carrierCode?: string | null;
  distanceKm?: number | null;
  address?: { lat?: number | null; lng?: number | null } | null;
}
export interface ShippingQuote {
  carrier: string;
  baseFee: number; feePerKg: number; feeBeforeDiscount: number;
  discount: number; finalFee: number; appliedVoucher?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ShippingPublicService {
  private base = `${environment.apiUrl}/public/shipping`;
  constructor(private http: HttpClient) {}

  quotes(payload: ShippingQuoteRequest): Observable<ShippingQuote[]> {
    return this.http.post<ShippingQuote[]>(`${this.base}/quotes`, payload);
  }

  previewVoucher(payload: ShippingQuoteRequest): Observable<ShippingQuote> {
    return this.http.post<ShippingQuote>(`${this.base}/quotes/preview-voucher`, payload);
  }
}