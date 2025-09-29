import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Page, OrderListItemDto, OrderDetailDto, OrderStatus
} from '../../models/order-v2.model';

// ⚠️ ĐƯỜNG DẪN IMPORT environment:
// nếu dự án của bạn dùng cấu trúc mặc định Angular:
//   src/environments/environment.ts
// thì từ folder này (src/app/admin/services) đi tới:
//   ../../../environments/environment
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderV2Service {
  // Base API lấy từ environment: "http://localhost:8080/api/v2"
  private readonly BASE = `${environment.apiUrl}/v2`;

  constructor(private http: HttpClient) {}

  listAll(page = 0, size = 20): Observable<Page<OrderListItemDto>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get<Page<OrderListItemDto>>(`${this.BASE}/admin/orders`, { params });
  }

  listByStatus(status: string, page = 0, size = 20): Observable<Page<OrderListItemDto>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    if (status) params = params.set('status', status);
    return this.http.get<Page<OrderListItemDto>>(`${this.BASE}/admin/orders`, { params });
  }

  search(opts: {
    status?: string; province?: string; carrierCode?: string; q?: string;
    dateFrom?: string; dateTo?: string; minTotal?: number; maxTotal?: number;
    page?: number; size?: number;
  }): Observable<Page<OrderListItemDto>> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 20));
    (['status','province','carrierCode','q','dateFrom','dateTo'] as const)
      .forEach(k => { const v = (opts as any)[k]; if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v)); });
    if (opts.minTotal != null) params = params.set('minTotal', String(opts.minTotal));
    if (opts.maxTotal != null) params = params.set('maxTotal', String(opts.maxTotal));

    return this.http.get<Page<OrderListItemDto>>(`${this.BASE}/admin/orders/search`, { params });
  }

  detail(id: number): Observable<OrderDetailDto> {
    return this.http.get<OrderDetailDto>(`${this.BASE}/admin/orders/${id}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<OrderDetailDto> {
    return this.http.post<OrderDetailDto>(`${this.BASE}/admin/orders/${id}/status`, { status });
  }

  cancel(id: number): Observable<OrderDetailDto> {
    return this.http.post<OrderDetailDto>(`${this.BASE}/admin/orders/${id}/cancel`, {});
  }
}
