import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateOrderItem {
  productId: number;
  quantity: number;
  weightKgPerItem?: number;
}

/**
 * Khớp backend: đã bổ sung destLat/destLng để OrderService tính khoảng cách.
 * (Jackson sẽ map đúng; thêm field này là cần thiết, không gây lỗi.)
 */
export interface CreateOrderRequest {
  receiverName: string;
  phone: string;
  addressLine: string;
  province: string;
  voucherCode?: string | null;
  items: CreateOrderItem[];

  // mới thêm — bắt buộc cho backend mới
  destLat: number;
  destLng: number;
}

export interface CreateOrderResponse {
  id: number;
  status: string;
  grandTotal: number;
}

@Injectable({ providedIn: 'root' })
export class OrderClientService {
  private base = `${environment.apiUrl}/client/orders`;
  constructor(private http: HttpClient) {}

  create(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.base, payload);
  }
}
