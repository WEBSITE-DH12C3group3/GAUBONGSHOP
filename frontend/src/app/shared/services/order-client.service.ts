import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateOrderItem { productId: number; quantity: number; weightKgPerItem?: number; }
export interface CreateOrderRequest {
  receiverName: string;
  phone: string;
  addressLine: string;
  province: string;
  voucherCode?: string | null;
  items: CreateOrderItem[];
}
export interface CreateOrderResponse { id: number; status: string; grandTotal: number; }

@Injectable({ providedIn: 'root' })
export class OrderClientService {
  private base = `${environment.apiUrl}/client/orders`;
  constructor(private http: HttpClient) {}
  create(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.base, payload);
  }
}