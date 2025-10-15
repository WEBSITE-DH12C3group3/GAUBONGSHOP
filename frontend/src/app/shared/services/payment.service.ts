import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = 'http://localhost:8080/api/payment/vnpay'; // ✅ Sửa tuyệt đối URL backend

  constructor(private http: HttpClient) {}

  create(orderCode: string, amount: number) {
    return this.http.post<{ paymentUrl: string }>(
      `${this.baseUrl}/create`,
      { orderCode, amount },
      { withCredentials: false }
    );
  }
}
