// src/app/core/services/shipping.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShippingQuoteReq {
  orderSubtotal: number;
  weightKg: number;
  destLat: number;
  destLng: number;
  voucherCode?: string;
  carrierCode?: string;
  serviceCode?: string;
}

export interface ShippingQuoteRes {
  distanceKm: number;
  feeBeforeVoucher: number;
  feeAfterVoucher: number;
  etaDaysMin: number;
  etaDaysMax: number;
  carrier: string;
  service: string;
}

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private base = '/api/public/shipping';

  constructor(private http: HttpClient) {}

  quote(req: ShippingQuoteReq): Observable<ShippingQuoteRes> {
    return this.http.post<ShippingQuoteRes>(`${this.base}/quotes`, req);
  }
}
