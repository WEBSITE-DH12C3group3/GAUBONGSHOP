// src/app/features/cart/cart.ts
import { Component, OnInit, NgZone, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CartService } from '../../shared/services/cart.service';
import { environment } from '../../../environments/environment';
import { CouponService, ApplyCouponRequest } from '../../shared/services/coupon.service';
import { FormsModule } from '@angular/forms';

type CartItem = {
  productId: number;
  productName: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  selected?: boolean | null;
  availableStock?: number | null;
  // ===== thêm optional scope =====
  categoryId?: number | null;
  brandId?: number | null;
};

type CartSummary = {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  hasAnySelected: boolean;
  selectedQuantity: number;
  selectedAmount: number;
};

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule],
})
export class CartComponent implements OnInit {
  data: CartSummary = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    hasAnySelected: false,
    selectedQuantity: 0,
    selectedAmount: 0,
  };

  // Hiển thị ảnh: chuẩn hoá base (cắt /api nếu có), + fallback
  private _imgBase = (() => {
    const raw = ((environment as any).apiUrl ?? (environment as any).api ?? 'http://localhost:8080') as string;
    return raw.replace(/\/+$/, '').replace(/\/api$/, '');
  })();
  private _fallbackImg = 'https://placehold.co/120x120?text=No+Image';

  couponCode = '';
  couponPreview: { code: string; discountAmount: number } | null = null;

  // ===== thêm router để chuyển sang checkout =====
  private router = inject(Router);
  // ==============================================

  constructor(
    private api: CartService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private couponApi: CouponService
  ) {}

  ngOnInit(): void { this.load(); }

  private load() {
    this.api.getMyCart().subscribe({
      next: (d: any) =>
        this.zone.run(() => {
          this.data = d as CartSummary;
          this.cdr.markForCheck();
        }),
      error: (e) => console.error('Lỗi tải giỏ hàng:', e),
    });
  }

  imgUrl(path?: string | null): string {
    if (!path || !`${path}`.trim()) return this._fallbackImg;
    const clean = `${path}`.trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    const joined = clean.startsWith('/') ? clean : `/${clean}`;
    return this._imgBase + joined;
  }

  onImgErr(ev: Event) {
    const img = ev?.target as HTMLImageElement | null;
    if (!img) return;
    const ds = img.dataset as DOMStringMap;
    if (ds['fallback'] === '1') return;
    ds['fallback'] = '1';
    img.src = this._fallbackImg;
  }

  inc(item: CartItem) {
    const stock = item.availableStock ?? Number.MAX_SAFE_INTEGER;
    const q = Math.min(stock, (item.quantity ?? 1) + 1);
    this.update(item, q);
  }

  dec(item: CartItem) {
    const q = Math.max(1, (item.quantity ?? 1) - 1);
    this.update(item, q);
  }

  update(item: CartItem, q: number) {
    this.api.update(item.productId, q).subscribe({
      next: (d: any) =>
        this.zone.run(() => {
          this.data = d as CartSummary;
          this.cdr.markForCheck();
        }),
      error: (e) => console.error('Không cập nhật được số lượng:', e),
    });
  }

  toggleSelect(item: CartItem) {
    const selected = !(item.selected ?? false);
    this.api.select(item.productId, selected).subscribe({
      next: (d: any) =>
        this.zone.run(() => {
          this.data = d as CartSummary;
          this.cdr.markForCheck();
        }),
      error: (e) => console.error('Không cập nhật chọn/bỏ chọn:', e),
    });
  }

  setAll(selected: boolean) {
    this.api.selectAll(selected).subscribe({
      next: (d: any) =>
        this.zone.run(() => {
          this.data = d as CartSummary;
          this.cdr.markForCheck();
        }),
      error: (e) => console.error('Không cập nhật chọn tất cả:', e),
    });
  }

  remove(item: CartItem) {
    this.api.remove(item.productId).subscribe({
      next: (d: any) =>
        this.zone.run(() => {
          this.data = d as CartSummary;
          this.cdr.markForCheck();
        }),
      error: (e) => console.error('Không xóa được sản phẩm khỏi giỏ:', e),
    });
  }

  previewCoupon() {
    if (!this.data?.items?.length || !this.couponCode.trim()) return;
    const orderTotal = this.data.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

    const items = this.data.items.map((it: any) => ({
      productId: it.productId,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      categoryId: it.categoryId ?? it.product?.categoryId ?? null,
      brandId: it.brandId ?? it.product?.brandId ?? null,
      discounted: false
    }));

    const req: ApplyCouponRequest = {
      code: this.couponCode.trim(),
      orderTotal,
      items
    };

    this.couponApi.apply(req).subscribe({
      next: res => this.couponPreview = { code: res.code, discountAmount: res.discountAmount || 0 },
      error: err => alert(err?.error?.error || 'Mã không hợp lệ')
    });
  }

  clearCoupon() {
    this.couponPreview = null;
    this.couponCode = '';
  }

  // ===== tính tổng sau khi giảm & điều hướng checkout =====
  get subtotal(): number {
    return (this.data?.items || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  }

  get payable(): number {
    const discount = this.couponPreview?.discountAmount ?? 0;
    const result = this.subtotal - discount;
    return result > 0 ? result : 0;
  }

  goCheckout() {
    const code = (this.couponPreview?.code || this.couponCode || '').trim();
    if (code) localStorage.setItem('couponCode', code);
    this.router.navigate(['/checkout'], { queryParams: code ? { coupon: code } : {} });
  }
  // =========================================================
}
