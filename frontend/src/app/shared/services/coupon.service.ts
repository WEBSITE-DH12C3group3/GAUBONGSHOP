import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type ApplyCouponItem = {
  productId: number;
  unitPrice: number;
  quantity: number;
  categoryId?: number | null;   // <-- optional
  brandId?: number | null;      // <-- optional
  discounted?: boolean;
};

export type ApplyCouponRequest = {
  code: string;
  orderTotal: number;
  items: ApplyCouponItem[];
  userId?: number | null;
  userRole?: string | null;
  isFirstOrder?: boolean | null;
  paymentMethod?: string | null;
  region?: string | null;
};

export type ApplyCouponResponse = {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
  finalTotal: number;
  message?: string;
};

@Injectable({ providedIn: 'root' })
export class CouponService {
  private base = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  apply(req: ApplyCouponRequest) {
    return this.http.post<ApplyCouponResponse>(`${this.base}/apply`, req);
  }
}
