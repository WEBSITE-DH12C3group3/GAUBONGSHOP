import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CartService } from '../../shared/services/cart.service'; // ✅ dọn giỏ hàng

type OrderSuccessState = {
  code?: string;
  total?: number;
  shippingFee?: number;
  itemsAmount?: number;
  receiverName?: string;
  phone?: string;
  addressLine?: string;
  province?: string;
  note?: string;
  etaDays?: number;
  paymentMethod?: 'COD' | 'VNPay' | string;
  id?: number | string;
};

@Component({
  selector: 'app-order-success-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './order-success-page.html',
  styleUrls: ['./order-success-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSuccessPageComponent {
  orderCode = '';
  message = '';
  amount = 0;
  state: OrderSuccessState = {};

  constructor(
    private ar: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private cartSvc: CartService, // ✅ Tiêm dịch vụ giỏ hàng
  ) {
    // ✅ 1️⃣ Lấy query params từ URL (VNPay redirect)
    const qp = this.ar.snapshot.queryParamMap;
    this.orderCode = decodeURIComponent(qp.get('orderId') ?? '').trim(); // vnp_TxnRef
    this.message = decodeURIComponent(qp.get('message') ?? '');
    this.amount = Number(qp.get('amount') ?? 0) / 100; // VNPay trả *100

    // ✅ 2️⃣ Lấy dữ liệu tạm nếu có (tránh reload trắng trang)
    const navState =
      (this.router.getCurrentNavigation()?.extras?.state as OrderSuccessState) || {};
    const histState =
      (typeof window !== 'undefined'
        ? (window.history?.state as OrderSuccessState)
        : {}) || {};
    const localState = (() => {
      if (!this.orderCode) return {};
      try {
        const raw = localStorage.getItem(`order_success_${this.orderCode}`);
        return raw ? (JSON.parse(raw) as OrderSuccessState) : {};
      } catch {
        return {};
      }
    })();

    // ✅ Ưu tiên thứ tự: navigation → history → local
    this.state = { ...localState, ...histState, ...navState };
    if (!this.state.code && this.orderCode) this.state.code = this.orderCode;

    // ✅ 3️⃣ Dọn giỏ hàng sau khi thanh toán thành công
    this.cartSvc.clear().subscribe({
      next: () => console.log('🧹 Giỏ hàng đã được dọn sau khi thanh toán'),
      error: () => console.warn('⚠️ Không thể dọn giỏ hàng (bỏ qua lỗi)'),
    });

    // ✅ 4️⃣ Nếu chưa có dữ liệu thật → gọi API backend
    if (this.orderCode) this.fetchOrderFromApi(this.orderCode);
  }

  /** 🔹 Gọi API lấy đơn hàng thật từ backend */
  fetchOrderFromApi(orderCode: string) {
    this.http
      .get<any>(`http://localhost:8080/api/client/orders/code/${orderCode}`)
      .subscribe({
        next: (res) => {
          this.state = {
            code: res.orderCode || orderCode,
            total: res.grandTotal ?? res.totalAmount ?? this.amount,
            shippingFee: res.shippingFee ?? 0,
            itemsAmount: res.itemsTotal ?? res.subTotal ?? res.itemsTotal ?? 0,
            receiverName: res.receiverName ?? '',
            phone: res.phone ?? '',
            addressLine: res.addressLine ?? '',
            province: res.province ?? '',
            paymentMethod: res.paymentMethod ?? 'VNPay',
          };

          // ✅ Lưu cache localStorage để reload vẫn còn
          localStorage.setItem(
            `order_success_${orderCode}`,
            JSON.stringify(this.state)
          );

          this.cdr.markForCheck(); // Cập nhật UI ngay
        },
        error: (err) => {
          console.error('❌ Lỗi khi tải đơn hàng:', err);
        },
      });
  }

  /** ✅ Sao chép mã đơn hàng */
  copyCode(): void {
    if (!this.state.code) return;
    navigator.clipboard?.writeText(this.state.code).catch(() => {});
  }

  /** ✅ Tổng tiền hàng */
  get itemsAmountSafe(): number {
    const items = Number(this.state.itemsAmount);
    if (!Number.isNaN(items) && items > 0) return items;

    const total = Number(this.state.total);
    const ship = Number(this.state.shippingFee);
    if (!Number.isNaN(total) && !Number.isNaN(ship))
      return Math.max(0, total - ship);

    return 0;
  }

  /** ✅ Tổng thanh toán */
  get totalSafe(): number {
    const total = Number(this.state.total);
    if (!Number.isNaN(total) && total >= 0) return total;
    return this.itemsAmountSafe + Number(this.state.shippingFee || 0);
  }
}
