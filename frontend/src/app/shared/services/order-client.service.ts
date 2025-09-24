import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateOrderRequest, CreateOrderResponse } from '../../models/checkout.models';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderClientService {
  private base = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  create(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.base, payload);
  }
}
