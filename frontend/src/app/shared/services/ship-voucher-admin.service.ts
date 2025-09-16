import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ShipVoucher, ShipVoucherResponse } from '../../models/ship-voucher.model';

@Injectable({ providedIn: 'root' })
export class ShipVoucherAdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin/shipping-vouchers`;
  constructor(private http: HttpClient) {}

  private norm = (v: any): ShipVoucher => ({
    id: v.id,
    code: v.code,
    description: v.description ?? '',
    discountType: v.discountType,
    discountValue: +v.discountValue,
    maxDiscountAmount: v.maxDiscountAmount != null ? +v.maxDiscountAmount : null,
    minOrderAmount: v.minOrderAmount != null ? +v.minOrderAmount : null,
    minShippingFee: v.minShippingFee != null ? +v.minShippingFee : null,
    applicableCarriers: v.applicableCarriers ?? null,
    regionInclude: v.regionInclude ?? null,
    regionExclude: v.regionExclude ?? null,
    maxUses: v.maxUses != null ? +v.maxUses : null,
    usedCount: v.usedCount != null ? +v.usedCount : 0,
    maxUsesPerUser: v.maxUsesPerUser != null ? +v.maxUsesPerUser : null,
    startDate: v.startDate ?? null,
    endDate: v.endDate ?? null,
    active: !!v.active,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt
  });

  private normList = (raw: any): ShipVoucherResponse => ({
    items: (raw?.items ?? []).map(this.norm),
    page: raw?.page ?? 0,
    size: raw?.size ?? 10,
    totalPages: raw?.totalPages ?? 1,
    total: raw?.totalElements
  });

  list(q = '', page = 0, size = 10, sort = 'id,desc'): Observable<ShipVoucherResponse> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (q) params = params.set('q', q);
    return this.http.get<any>(this.apiUrl, { params }).pipe(map(this.normList));
  }

  get(id: number): Observable<ShipVoucher> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(r => this.norm(r?.voucher ?? r)));
  }

  create(payload: any): Observable<ShipVoucher> {
    return this.http.post<any>(this.apiUrl, payload).pipe(map(r => this.norm(r?.voucher ?? r)));
  }

  update(id: number, payload: any): Observable<ShipVoucher> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(map(r => this.norm(r?.voucher ?? r)));
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  setActive(id: number, value: boolean) {
    return this.http.patch<any>(`${this.apiUrl}/${id}/active`, null, { params: { value } })
      .pipe(map(r => this.norm(r?.voucher ?? r)));
  }
}
