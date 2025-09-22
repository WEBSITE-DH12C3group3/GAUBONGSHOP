import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { OrderResponse, OrderStatus } from '../../models/order.model';
import { Page } from '../../models/page.model';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly base = `${environment.apiUrl}/admin/orders`;

  constructor(private http: HttpClient) {}

  list(status = '', page = 0, size = 20): Observable<Page<OrderResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<OrderResponse>>(this.base, { params });
  }

  detail(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.base}/${id}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.base}/${id}/status`, { status });
  }
}
