import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ShippingQuoteRequest, ShippingQuote,
  ShippingVoucherPreviewRequest, ShippingVoucherPreview
} from '../../models/checkout.models';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShippingPublicService {
  private base = `${environment.apiUrl}/public/shipping`;

  constructor(private http: HttpClient) {}

  quotes(payload: ShippingQuoteRequest): Observable<ShippingQuote[]> {
    return this.http.post<ShippingQuote[]>(`${this.base}/quotes`, payload);
  }

  previewVoucher(payload: ShippingVoucherPreviewRequest): Observable<ShippingVoucherPreview> {
    return this.http.post<ShippingVoucherPreview>(`${this.base}/quotes/preview-voucher`, payload);
  }
}
