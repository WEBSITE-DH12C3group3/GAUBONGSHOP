import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

// 👇 NEW: import CartService (sửa lại path nếu dự án bạn khác)
import { CartService } from '../../shared/services/cart.service';

type OrderSuccessState = {
  id?: string | number;
  code?: string | number;        // mã đơn
  total?: number;
  shippingFee?: number;
  itemsAmount?: number;
  receiverName?: string;
  phone?: string;
  addressLine?: string;
  province?: string;
  note?: string;
  etaDays?: number;              // ngày dự kiến giao (nếu có)
  paymentMethod?: 'COD' | string;
};

@Component({
  selector: 'app-order-success-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-success-page.html',
  styleUrls: ['./order-success-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSuccessPageComponent {
  id = '';
  state: OrderSuccessState = {};

  // 👇 NEW: tiêm CartService
  constructor(
    private ar: ActivatedRoute,
    private router: Router,
    private cartSvc: CartService,            // NEW
  ) {
    // 1) Lấy id từ query
    this.id = this.ar.snapshot.queryParamMap.get('id') ?? '';

    // 2) Lấy state từ navigation (khi vừa điều hướng xong)
    const nav = this.router.getCurrentNavigation();
    const fromNav = (nav?.extras?.state as OrderSuccessState) || {};

    // 3) Lấy từ history.state (một số trình duyệt giữ lại sau điều hướng)
    const fromHistory = (typeof window !== 'undefined'
      ? (window.history?.state as OrderSuccessState)
      : {}) || {};

    // 4) Lấy từ localStorage (khi refresh / mở link trực tiếp)
    const fromLocal = (() => {
      if (!this.id) return {};
      try {
        const raw = localStorage.getItem(`order_success_${this.id}`);
        return raw ? (JSON.parse(raw) as OrderSuccessState) : {};
      } catch {
        return {};
      }
    })();

    // Gộp theo độ ưu tiên: nav → history → localStorage
    this.state = { id: this.id, ...fromLocal, ...fromHistory, ...fromNav };

    // Nếu chưa có code, dùng id để UI không trống
    if (!this.state.code && this.id) this.state.code = this.id;

    // 👉 NEW: DỌN GIỎ HÀNG AN TOÀN khi vào trang thành công
    // - Nếu giỏ đã trống: không sao.
    // - Nếu còn dữ liệu local/server: xóa để badge = 0 và không còn SP hiển thị.
    this.cartSvc.clear().subscribe({
      next: () => {},
      error: () => {
        // Không chặn UI nếu clear thất bại; có thể log nếu cần
        // console.warn('Clear cart failed on success page');
      }
    });
  }

  copyCode(): void {
    const code = this.orderCode;
    if (!code) return;
    try {
      navigator.clipboard?.writeText(code);
    } catch {}
  }

  /** Mã đơn để hiển thị */
  get orderCode(): string {
    return (this.state.code?.toString() || this.id) as string;
  }

  /** Tiền hàng an toàn: ưu tiên state.itemsAmount; nếu thiếu thì = total - shippingFee */
  get itemsAmountSafe(): number {
    const items = Number(this.state.itemsAmount);
    if (!Number.isNaN(items) && items > 0) return items;

    const total = Number(this.state.total);
    const ship  = Number(this.state.shippingFee);
    if (!Number.isNaN(total) && !Number.isNaN(ship)) return Math.max(0, total - ship);

    return 0;
  }

  /** Tổng thanh toán an toàn */
  get totalSafe(): number {
    const total = Number(this.state.total);
    if (!Number.isNaN(total) && total >= 0) return total;
    return this.itemsAmountSafe + Number(this.state.shippingFee || 0);
  }
}
