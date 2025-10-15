import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ShipVoucher, ShipVoucherResponse } from '../../models/ship-voucher.model';

@Injectable({ providedIn: 'root' })
export class ShipVoucherAdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin/shipping-vouchers`;
  constructor(private http: HttpClient) {}

  /** Chuẩn hoá item từ API về đúng ShipVoucher FE đang dùng */
  private norm = (v: any): ShipVoucher => ({
    id: v.id,
    code: v.code,
    description: v.description ?? '',
    // enum đưa về chữ thường cho FE (BE nhận UPPERCASE)
    discountType: (v.discountType ?? '').toString().toLowerCase(),
    discountValue: v.discountValue != null ? +v.discountValue : null,
    maxDiscountAmount: v.maxDiscountAmount != null ? +v.maxDiscountAmount : null,
    minOrderAmount: v.minOrderAmount != null ? +v.minOrderAmount : null,

    // BE dùng startAt/endAt; nếu API cũ trả startDate/endDate thì vẫn map được
    startAt: v.startAt ?? v.startDate ?? null,
    endAt: v.endAt ?? v.endDate ?? null,

    usageLimit: v.usageLimit != null ? +v.usageLimit : null,
    usedCount: v.usedCount != null ? +v.usedCount : 0,

    active: !!v.active,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt
  });

  /** Chuẩn hoá danh sách + phân trang */
  private normList = (raw: any): ShipVoucherResponse => {
  const itemsRaw = raw?.items ?? raw?.content ?? raw ?? [];
  return {
    items: Array.isArray(itemsRaw) ? itemsRaw.map(this.norm) : [],
    page: raw?.page ?? raw?.number ?? 0,
    size: raw?.size ?? raw?.size ?? 10,
    totalPages: raw?.totalPages ?? raw?.total_pages ?? 1,
    total: raw?.total ?? raw?.totalElements ?? itemsRaw.length
  };
}


  /** Giữ nguyên chữ ký hàm list(q, page, size, sort) nhưng sửa HttpParams sang string */
  list(q = '', page = 0, size = 10, sort = 'id,desc') {
  let params = new HttpParams()
    .set('page', String(page))
    .set('size', String(size))
    .set('sort', sort);
  if (q) params = params.set('q', q);
  return this.http.get<any>(this.apiUrl, { params }).pipe(map(this.normList));
}


  get(id: number): Observable<ShipVoucher> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(r => this.norm(r?.voucher ?? r)));
  }

  /** Tự động chuẩn hoá payload trước khi gửi: enum → UPPERCASE, key startDate/endDate → startAt/endAt */
  private toBackendPayload(payload: any) {
  const body: any = { ...payload };
  if (body.startDate && !body.startAt) body.startAt = body.startDate;
  if (body.endDate && !body.endAt) body.endAt = body.endDate;
  delete body.startDate; delete body.endDate;

  if (body.discountType) body.discountType = String(body.discountType).toUpperCase();

  // bỏ field không có trong BE
  delete body.minShippingFee;
  delete body.applicableCarriers;
  delete body.regionInclude;
  delete body.regionExclude;
  delete body.maxUses;
  delete body.maxUsesPerUser;

  return body;
}

  create(payload: any): Observable<ShipVoucher> {
  // ép discountType UPPERCASE
  if (payload.discountType) {
    payload.discountType = String(payload.discountType).toUpperCase();
  }

  // đồng bộ field ngày nếu cần
  if (payload.startDate && !payload.startAt) payload.startAt = payload.startDate;
  if (payload.endDate && !payload.endAt) payload.endAt = payload.endDate;

  return this.http.post<any>(this.apiUrl, payload).pipe(map(r => this.norm(r?.voucher ?? r)));
}

update(id: number, payload: any): Observable<ShipVoucher> {
  if (payload.discountType) {
    payload.discountType = String(payload.discountType).toUpperCase();
  }

  if (payload.startDate && !payload.startAt) payload.startAt = payload.startDate;
  if (payload.endDate && !payload.endAt) payload.endAt = payload.endDate;

  return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(map(r => this.norm(r?.voucher ?? r)));
}


  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  setActive(id: number, value: boolean) {
    return this.http
      .patch<any>(`${this.apiUrl}/${id}/active`, null, { params: new HttpParams().set('value', String(value)) })
      .pipe(map(r => this.norm(r?.voucher ?? r)));
  }
}
