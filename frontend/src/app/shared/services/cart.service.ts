// src/app/shared/services/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

type GuestItem = {
  productId: number;
  quantity: number;
  selected?: boolean;
  // meta để hiển thị khi guest (không bắt buộc nhưng rất hữu ích)
  productName?: string;
  unitPrice?: number;
  imageUrl?: string | null;
};

@Injectable({ providedIn: 'root' })
export class CartService {
  // ====== API base (tự cắt /api nếu cần cho ảnh) ======
  private apiRoot = ((environment as any).apiUrl ?? (environment as any).api ?? 'http://localhost:8080').replace(/\/+$/, '');
  private base = `${this.apiRoot}${/\/api$/.test(this.apiRoot) ? '' : '/api'}/cart`;

  // Nếu BE dùng cookie-session thì để true; nếu dùng JWT qua interceptor có thể false
  private httpOpts = { withCredentials: true };

  // ====== Badge count (dùng chung cho guest & user) ======
  private _count$ = new BehaviorSubject<number>(0);
  readonly count$ = this._count$.asObservable();

  private LS_KEY = 'guest_cart_v1';
  private MERGED_FLAG_KEY = 'guest_cart_merged';

  constructor(private http: HttpClient) {}

  // ========== AUTH check ==========
  private rawToken(): string {
    try {
      return (
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('jwt') ||
        ''
      );
    } catch {
      return '';
    }
  }
  private isLoggedIn(): boolean {
    const t = this.rawToken();
    return !!t && t.length > 10; // đơn giản
  }

  // ========== Guest local helpers ==========
  private readLocal(): GuestItem[] {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  private writeLocal(list: GuestItem[]): void {
    try {
      localStorage.setItem(this.LS_KEY, JSON.stringify(list));
      this._count$.next(list.reduce((s, x) => s + (x.quantity || 0), 0));
    } catch {}
  }

  private normalizeSummary = (r: any) => {
    if (r?.items?.length) {
      r.items = r.items.map((it: any) => ({
        ...it,
        imageUrl: it?.imageUrl ?? undefined, // null -> undefined
      }));
    }
    return r;
  };

  // ========== Public API (tự xử lý guest/user) ==========
  refreshCount() {
    if (this.isLoggedIn()) {
      return this.http.get<any>(this.base, this.httpOpts).pipe(
        tap((r) => this._count$.next(r?.totalQuantity ?? 0))
      ).subscribe();
    } else {
      // guest
      const list = this.readLocal();
      this._count$.next(list.reduce((s, x) => s + (x.quantity || 0), 0));
      return { unsubscribe() {} } as any;
    }
  }

  /** Lấy giỏ cho UI */
  getSummary(): Observable<any> {
    if (this.isLoggedIn()) {
      return this.http.get<any>(this.base, this.httpOpts).pipe(
        map(this.normalizeSummary),
        tap((r) => this._count$.next(r?.totalQuantity ?? 0))
      );
    } else {
      // guest summary dựng từ local
      const list = this.readLocal();
      const items = list.map((x) => {
        const unit = Number(x.unitPrice ?? 0);
        const line = unit * (x.quantity || 0);
        return {
          productId: x.productId,
          productName: x.productName ?? 'Sản phẩm',
          imageUrl: x.imageUrl ?? undefined,
          unitPrice: unit,
          quantity: x.quantity,
          lineTotal: line,
          selected: x.selected ?? true,
          availableStock: undefined,
        };
      });
      const cartTotal = items.reduce((s, i) => s + i.lineTotal, 0);
      const cartQty = items.reduce((s, i) => s + i.quantity, 0);
      const hasAnySelected = items.some(i => i.selected);
      const chosen = hasAnySelected ? items.filter(i => i.selected) : items;
      const selTotal = chosen.reduce((s, i) => s + i.lineTotal, 0);
      const selQty = chosen.reduce((s, i) => s + i.quantity, 0);

      const resp = {
        items, totalQuantity: cartQty, totalAmount: cartTotal,
        hasAnySelected, selectedQuantity: selQty, selectedAmount: selTotal
      };
      // đồng bộ badge
      this._count$.next(cartQty);
      return of(resp);
    }
  }

  /** Alias của getSummary cho tương thích code cũ */
  getMyCart() { return this.getSummary(); }

  checkoutItems() {
    if (this.isLoggedIn()) {
      return this.http.get<any>(`${this.base}/checkout-items`, this.httpOpts).pipe(
        map(this.normalizeSummary)
      );
    } else {
      // Với guest: dùng tập được chọn (y như getSummary)
      return this.getSummary();
    }
  }

  /** Thêm vào giỏ. Với guest có thể đưa meta để cart hiển thị đẹp */
  add(productId: number, quantity = 1, meta?: { name?: string; price?: number; imageUrl?: string | null }) {
    if (this.isLoggedIn()) {
      return this.http.post<any>(`${this.base}/add`, { productId, quantity }, this.httpOpts).pipe(
        map(this.normalizeSummary),
        tap((r) => this._count$.next(r?.totalQuantity ?? 0))
      );
    } else {
      const list = this.readLocal();
      const idx = list.findIndex(x => x.productId === productId);
      if (idx >= 0) {
        list[idx].quantity = Math.max(1, (list[idx].quantity || 0) + quantity);
        // giữ meta cũ nếu có, cập nhật nếu meta mới đầy đủ
        list[idx].productName = meta?.name ?? list[idx].productName;
        list[idx].unitPrice   = meta?.price ?? list[idx].unitPrice;
        list[idx].imageUrl    = (meta?.imageUrl ?? list[idx].imageUrl) ?? undefined;
      } else {
        list.push({
          productId,
          quantity: Math.max(1, quantity),
          selected: true,
          productName: meta?.name,
          unitPrice: meta?.price,
          imageUrl: meta?.imageUrl ?? undefined,
        });
      }
      this.writeLocal(list);
      return this.getSummary();
    }
  }

  updateQuantity(productId: number, quantity: number) {
    if (this.isLoggedIn()) {
      return this.http.patch<any>(`${this.base}/item/${productId}`, { quantity }, this.httpOpts).pipe(
        map(this.normalizeSummary),
        tap((r) => this._count$.next(r?.totalQuantity ?? 0))
      );
    } else {
      const list = this.readLocal();
      const idx = list.findIndex(x => x.productId === productId);
      if (idx >= 0) {
        if (quantity <= 0) list.splice(idx, 1);
        else list[idx].quantity = quantity;
        this.writeLocal(list);
      }
      return this.getSummary();
    }
  }

  /** Alias cho code cũ */
  update(productId: number, quantity: number) { return this.updateQuantity(productId, quantity); }

  select(productId: number, selected: boolean) {
    if (this.isLoggedIn()) {
      return this.http.patch<any>(`${this.base}/item/${productId}/select`, { selected }, this.httpOpts).pipe(
        map(this.normalizeSummary),
        tap((r) => this._count$.next(r?.totalQuantity ?? 0))
      );
    } else {
      const list = this.readLocal();
      const idx = list.findIndex(x => x.productId === productId);
      if (idx >= 0) {
        list[idx].selected = selected;
        this.writeLocal(list);
      }
      return this.getSummary();
    }
  }

  selectAll(selected: boolean) {
    if (this.isLoggedIn()) {
      return this.http.patch<any>(`${this.base}/select-all?selected=${selected}`, {}, this.httpOpts).pipe(
        map(this.normalizeSummary),
        tap((r) => this._count$.next(r?.totalQuantity ?? 0))
      );
    } else {
      const list = this.readLocal().map(x => ({ ...x, selected }));
      this.writeLocal(list);
      return this.getSummary();
    }
  }

  remove(productId: number) {
    if (this.isLoggedIn()) {
      return this.http.delete<any>(`${this.base}/item/${productId}`, this.httpOpts).pipe(
        map(this.normalizeSummary),
        tap((r) => this._count$.next(r?.totalQuantity ?? 0))
      );
    } else {
      const list = this.readLocal().filter(x => x.productId !== productId);
      this.writeLocal(list);
      return this.getSummary();
    }
  }

  clear() {
    if (this.isLoggedIn()) {
      return this.http.delete(`${this.base}/clear`, this.httpOpts).pipe(
        tap(() => this._count$.next(0))
      );
    } else {
      this.writeLocal([]);
      return of(true);
    }
  }

  /** Gọi sau khi user đăng nhập/đăng ký để merge cart local lên server */
  mergeLocalToServer(): Observable<any> {
    if (!this.isLoggedIn()) return of(null);
    // tránh merge lặp lại mỗi lần refresh (tuỳ bạn muốn thì bỏ cờ này)
    if (localStorage.getItem(this.MERGED_FLAG_KEY) === '1') return of(null);

    const list = this.readLocal();
    if (!list.length) {
      localStorage.setItem(this.MERGED_FLAG_KEY, '1');
      return of(null);
    }
    const payload = {
      items: list.map(x => ({
        productId: x.productId,
        quantity: x.quantity,
        selected: x.selected ?? true,
      }))
    };
    return this.http.post<any>(`${this.base}/merge`, payload, this.httpOpts).pipe(
      tap(() => {
        // clear guest cart sau merge
        this.writeLocal([]);
        localStorage.setItem(this.MERGED_FLAG_KEY, '1');
        // cập nhật badge từ server
        this.refreshCount();
      })
    );
  }
}
