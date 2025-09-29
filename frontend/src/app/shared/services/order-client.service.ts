import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type OrderStatus =
  | 'PENDING_PAYMENT' | 'PAID' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

export interface Page<T> {
  content: T[]; number: number; size: number; totalPages: number; totalElements: number;
}

export interface OrderListItemDto {
  id: number; status: OrderStatus; itemsTotal: number; shippingFee: number;
  shippingDiscount: number; grandTotal: number; receiverName: string; phone: string;
  addressLine: string; province: string; orderDate: string; // ISO
}

export interface OrderItemDto {
  productId: number; productName: string; unitPrice: number; quantity: number; weightKgPerItem: number;
}

export interface ShippingDto {
  carrier?: string | null; service?: string | null; trackingCode?: string | null;
  status?: string | null; etaDaysMin?: number | null; etaDaysMax?: number | null;
  distanceKm?: number | null; feeBefore?: number | null; discount?: number | null; feeFinal?: number | null;
}

export interface OrderDetailDto extends OrderListItemDto {
  userId: number; voucherCode?: string | null; weightKg?: number | null; shipping?: ShippingDto | null; items: OrderItemDto[];
}

/** Payload tạo đơn — khớp FE hiện có */
export interface CreateOrderItem { productId: number; quantity: number; weightKgPerItem?: number; }
export interface CreateOrderRequest {
  receiverName: string; phone: string; addressLine: string; province: string;
  voucherCode?: string | null; items: CreateOrderItem[];
  destLat: number; destLng: number;
}
export interface CreateOrderResponse { id: number; status: string; grandTotal: number; }

@Injectable({ providedIn: 'root' })
export class OrderClientService {
  // v2 cho list/detail/cancel/confirm
  private readonly BASE_V2 = `${environment.apiUrl}/v2/client/orders`;
  // v1 cho create (backend hiện có POST ở đây)
  private readonly BASE_V1 = `${environment.apiUrl}/client/orders`;

  constructor(private http: HttpClient) {}

  /** Tạo đơn: dùng endpoint v1 đang support POST */
  create(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.BASE_V1, payload);
  }

  /** Danh sách đơn của tôi (v2) */
  list(page = 0, size = 10): Observable<Page<OrderListItemDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<OrderListItemDto>>(this.BASE_V2, { params });
  }

  /** Lịch sử mua hàng = đã thanh toán */
  history(page = 0, size = 10): Observable<Page<OrderListItemDto>> {
    return this.list(page, size).pipe(map(p => ({ ...p, content: p.content.filter(x => x.status === 'PAID') })));
  }

  detail(id: number): Observable<OrderDetailDto> {
    return this.http.get<OrderDetailDto>(`${this.BASE_V2}/${id}`);
  }

  cancel(id: number) {
    return this.http.post<OrderDetailDto>(`${this.BASE_V2}/${id}/cancel`, {});
  }

  confirmReceived(id: number) {
    return this.http.post<OrderDetailDto>(`${this.BASE_V2}/${id}/confirm-received`, {});
  }
}
