import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  /** ✅ Địa chỉ backend VNPay API */
  private baseUrl = 'http://localhost:8080/api/payment/vnpay';

  constructor(private http: HttpClient) {}

  /**
   * ✅ Gửi yêu cầu tạo thanh toán VNPay
   * @param payload gồm thông tin người nhận + tổng tiền
   */
  create(payload: {
    receiverName: string;
    phone: string;
    addressLine: string;
    province: string;
    itemsTotal: number;
    shippingFee: number;
    grandTotal: number;
  }): Observable<{ paymentUrl: string; orderCode: string; amount: string }> {
    console.log('🧾 Gửi request tạo thanh toán VNPay:', payload);
    return this.http.post<{ paymentUrl: string; orderCode: string; amount: string }>(
      `${this.baseUrl}/create`,
      payload,
      { withCredentials: false }
    );
  }
}
