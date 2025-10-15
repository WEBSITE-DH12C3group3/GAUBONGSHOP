import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { OrderResponse } from '../../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  // Sửa: dùng base URL thống nhất + trả về Observable<OrderResponse>
  checkout(couponCode?: string): Observable<OrderResponse> {
    const body: any = {};
    if (couponCode && couponCode.trim()) body.couponCode = couponCode.trim();
    return this.http.post<OrderResponse>(`${this.base}/checkout`, body);
  }

  myOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.base}/my`);
  }

  myOrderDetail(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.base}/${id}`);
  }

  cancelMyOrder(id: number): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.base}/${id}/cancel`, {});
  }
}
