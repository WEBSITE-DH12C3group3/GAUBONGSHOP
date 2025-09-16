import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  startDate?: string | null; // ISO
  endDate?: string | null;   // ISO
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface CouponListResponse {
  items: Coupon[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class CouponAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/coupons`; // http://localhost:8080/api/admin/coupons

  list(q = '', page = 0, size = 10, sort = 'id,desc'): Observable<CouponListResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    if (q?.trim()) params = params.set('q', q.trim());
    return this.http.get<CouponListResponse>(this.base, { params });
  }

  get(id: number): Observable<Coupon> {
    return this.http.get<{ coupon: Coupon }>(`${this.base}/${id}`).pipe(
      // @ts-ignore
      map(resp => resp.coupon)
    );
  }

  create(payload: any): Observable<Coupon> {
    return this.http.post<{ coupon: Coupon }>(this.base, payload).pipe(
      // @ts-ignore
      map(resp => resp.coupon)
    );
  }

  update(id: number, payload: any): Observable<Coupon> {
    return this.http.put<{ coupon: Coupon }>(`${this.base}/${id}`, payload).pipe(
      // @ts-ignore
      map(resp => resp.coupon)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  setActive(id: number, value: boolean): Observable<Coupon> {
    return this.http.patch<{ coupon: Coupon }>(`${this.base}/${id}/active`, null, {
      params: new HttpParams().set('value', value)
    }).pipe(
      // @ts-ignore
      map(resp => resp.coupon)
    );
  }
}

// LƯU Ý: cần import 'map' của rxjs/operators
import { map } from 'rxjs/operators';
