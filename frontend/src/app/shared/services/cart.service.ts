import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CartSummary } from '../../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly base = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  getMyCart(): Observable<CartSummary> {
    return this.http.get<CartSummary>(`${this.base}`);
  }

  add(productId: number, quantity = 1): Observable<CartSummary> {
    return this.http.post<CartSummary>(`${this.base}/add`, { productId, quantity });
  }

  update(productId: number, quantity: number): Observable<CartSummary> {
    return this.http.put<CartSummary>(`${this.base}/item`, { productId, quantity });
  }

  remove(productId: number): Observable<CartSummary> {
    return this.http.delete<CartSummary>(`${this.base}/item/${productId}`);
  }

  clear(): Observable<void> {
    return this.http.delete<void>(`${this.base}/clear`);
  }
}
