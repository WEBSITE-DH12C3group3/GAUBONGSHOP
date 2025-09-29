import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderDetailDto } from '../../models/order-v2.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderV2ClientService {
  private readonly BASE = `${environment.apiUrl}/v2/client/orders`;

  constructor(private http: HttpClient) {}

  confirmReceived(orderId: number): Observable<OrderDetailDto> {
    return this.http.post<OrderDetailDto>(`${this.BASE}/${orderId}/confirm-received`, {});
  }
}
