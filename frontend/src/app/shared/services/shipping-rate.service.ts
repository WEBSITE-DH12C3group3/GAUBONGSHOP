import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ShippingRate } from '../../models/shipping-rate.model';

export interface RateQuery {
  query?: string;                      // tìm theo tên carrier
  active?: 'all' | 'true' | 'false';   // filter trạng thái
  page?: number;
  size?: number;
  sort?: string;                       // ví dụ 'carrier,asc'
}

export interface PageResp<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class ShippingRateService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/shipping-rates`;

  list(params: RateQuery) {
    let hp = new HttpParams();
    if (params.query) hp = hp.set('query', params.query);
    if (params.active && params.active !== 'all') hp = hp.set('active', params.active);
    hp = hp.set('page', String(params.page ?? 0))
           .set('size', String(params.size ?? 10))
           .set('sort', params.sort ?? 'carrier,asc');

    return this.http.get<PageResp<ShippingRate>>(this.base, { params: hp })
      .pipe(map(p => ({ ...p, content: p.content.map(this.deserialize) })));
  }

  get(id: number): Observable<ShippingRate> {
    return this.http.get<ShippingRate>(`${this.base}/${id}`).pipe(map(this.deserialize));
  }

  create(payload: ShippingRate): Observable<ShippingRate> {
    return this.http.post<ShippingRate>(this.base, this.serialize(payload)).pipe(map(this.deserialize));
  }

  update(id: number, payload: ShippingRate): Observable<ShippingRate> {
    return this.http.put<ShippingRate>(`${this.base}/${id}`, this.serialize(payload)).pipe(map(this.deserialize));
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggle(id: number) {
    return this.http.patch<ShippingRate>(`${this.base}/${id}/toggle`, {}).pipe(map(this.deserialize));
  }

  // --- helpers ---
  private serialize = (r: ShippingRate) => ({
    carrier: (r.carrier ?? '').trim(),
    baseFee: r.baseFee ?? 0,
    feePerKg: r.feePerKg ?? 0,
    freeThreshold: r.freeThreshold === undefined ? null : r.freeThreshold,
    active: r.active ?? true
  });

  private deserialize = (r: any): ShippingRate => ({
    id: r.id,
    carrier: r.carrier,
    baseFee: Number(r.baseFee ?? 0),
    feePerKg: Number(r.feePerKg ?? 0),
    freeThreshold: r.freeThreshold === null || r.freeThreshold === undefined ? null : Number(r.freeThreshold),
    active: !!r.active,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  });
}
