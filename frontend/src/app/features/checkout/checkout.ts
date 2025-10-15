import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { OrderService } from '../../shared/services/order.service';
import { OrderResponse } from '../../models/order.model';
import { CouponService, ApplyCouponRequest } from '../../shared/services/coupon.service';

// ===== lấy tổng tiền từ giỏ để preview ở Checkout =====
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.html'
})
export class CheckoutPage implements OnInit {
  private api = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private couponApi = inject(CouponService);
  private route = inject(ActivatedRoute);
  private cartApi = inject(CartService);     // <-- thêm: đọc tổng tiền từ giỏ

  placing = false;
  result?: OrderResponse;

  // ===== COUPON state =====
  couponCode = '';
  couponPreview: { code: string; discountAmount: number } | null = null;

  // Tổng tiền tạm tính & phí ship để hiển thị khi CHƯA đặt hàng
  subtotal = 0;
  shippingFee = 0;

  // (tuỳ chọn) truyền scope cho /coupons/apply
  checkoutItems: Array<{
    productId: number;
    unitPrice: number;
    quantity: number;
    categoryId?: number | null;
    brandId?: number | null;
  }> = [];
  // ========================

  ngOnInit(): void {
    // 1) Nhận mã từ cart (query/localStorage)
    const fromQuery = (this.route.snapshot.queryParamMap.get('coupon') || '').trim();
    const fromStorage = (localStorage.getItem('couponCode') || '').trim();
    if (fromQuery) this.couponCode = fromQuery;
    else if (fromStorage) this.couponCode = fromStorage;

    // 2) Lấy tổng tiền đã chọn từ giỏ để hiển thị trước khi đặt hàng
    this.cartApi.getMyCart().subscribe({
      next: (d: any) => this.zone.run(() => {
        // ưu tiên số tiền đã chọn; nếu không chọn gì thì dùng totalAmount
        this.subtotal = Number(d?.selectedAmount ?? d?.totalAmount ?? 0);

        // chuẩn bị items để preview coupon (optional)
        const items = Array.isArray(d?.items) ? d.items : [];
        this.checkoutItems = items.map((it: any) => ({
          productId: it.productId,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          categoryId: it.categoryId ?? it.product?.categoryId ?? null,
          brandId: it.brandId ?? it.product?.brandId ?? null
        }));

        // có mã sẵn thì preview luôn
        if (this.couponCode) {
          try { this.applyAtCheckout(); } catch {}
        }
        this.cdr.markForCheck();
      }),
      error: _ => {}
    });
  }

  // Tổng thanh toán hiển thị TRƯỚC khi đặt hàng
  get payablePreview(): number {
    const discount = this.couponPreview?.discountAmount ?? 0;
    const v = this.subtotal - discount + this.shippingFee;
    return v > 0 ? v : 0;
  }

  placeOrder() {
    if (this.placing) return;
    this.placing = true;

    const code = this.couponCode?.trim();
    this.api.checkout(code ? code : undefined).subscribe({
      next: (o) => this.zone.run(() => {
        this.result = o;

        // cập nhật theo dữ liệu BE trả về sau khi tạo đơn
        this.subtotal = Number(o.itemsTotal ?? 0);
        this.shippingFee = Number(o.shippingFee ?? 0);

        // dọn mã đã lưu
        localStorage.removeItem('couponCode');

        this.placing = false;
        this.cdr.markForCheck();
      }),
      error: _ => this.zone.run(() => {
        this.placing = false;
        this.cdr.markForCheck();
      })
    });
  }

  applyAtCheckout() {
    const code = this.couponCode?.trim();
    if (!code) { this.couponPreview = null; return; }

    const orderTotal = this.subtotal || 0;
    const items = this.checkoutItems || [];
    const req: ApplyCouponRequest = { code, orderTotal, items };

    this.couponApi.apply(req).subscribe({
      next: r => this.zone.run(() => {
        this.couponPreview = { code: r.code, discountAmount: r.discountAmount || 0 };
        this.cdr.markForCheck();
      }),
      error: _ => this.zone.run(() => {
        this.couponPreview = null;
        this.cdr.markForCheck();
      })
    });
  }

  clearCoupon() {
    this.couponCode = '';
    this.couponPreview = null;
    // không xoá localStorage ở đây để người dùng back lại vẫn giữ mã
  }
}
