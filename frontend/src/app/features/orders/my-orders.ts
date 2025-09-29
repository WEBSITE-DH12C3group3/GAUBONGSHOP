import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { AsyncPipe, DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  OrderClientService,
  Page,
  OrderListItemDto,
  OrderStatus,
} from '../../shared/services/order-client.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink, DatePipe, DecimalPipe, AsyncPipe],
  templateUrl: './my-orders.html',
})
export class MyOrdersComponent implements OnInit {
  /** mode = 'all' (đơn hàng của tôi) | 'history' (chỉ PAID) */
  @Input() mode: 'all' | 'history' = 'all';

  page = 0;
  size = 10;
  loading = false;
  data?: Page<OrderListItemDto>;
  rows: OrderListItemDto[] = [];

  readonly viLabelMap: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'Chờ duyệt / Chưa thanh toán',
    PACKING: 'Đang chuẩn bị hàng',
    SHIPPED: 'Đã gửi hàng',
    DELIVERED: 'Đã giao',
    PAID: 'Đã thanh toán',
    CANCELED: 'Đã hủy',
  };

  constructor(private api: OrderClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    const obs =
      this.mode === 'history'
        ? this.api.history(this.page, this.size)
        : this.api.list(this.page, this.size);

    obs.subscribe({
      next: (p) => {
        this.data = p;
        this.rows = p.content;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  go(p: number): void {
    if (!this.data) return;
    if (p < 0 || p >= this.data.totalPages) return;
    this.page = p;
    this.fetch();
  }

  statusLabel(s: OrderStatus): string {
    return this.viLabelMap[s] ?? s;
  }

  chipClass(s: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING_PAYMENT: 'bg-amber-50 text-amber-700 ring-amber-200',
      PACKING: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
      SHIPPED: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
      DELIVERED: 'bg-stone-50 text-stone-700 ring-stone-200',
      PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      CANCELED: 'bg-rose-50 text-rose-700 ring-rose-200',
    };
    return (
      'inline-flex items-center rounded-full px-2.5 h-7 text-xs font-semibold ring-1 ring-inset ' +
      map[s]
    );
  }

  /** % tiến trình cho thanh trạng thái */
  progressPct(s: OrderStatus): number {
    const steps: OrderStatus[] = ['PENDING_PAYMENT', 'PACKING', 'SHIPPED', 'DELIVERED', 'PAID'];
    const idx = Math.max(0, steps.indexOf(s));
    return Math.round((idx / (steps.length - 1)) * 100);
  }

  /** hint phụ khi đã giao */
  statusHint(s: OrderStatus): string | null {
    return s === 'DELIVERED' ? 'Chờ thanh toán' : null;
  }

  /** hành động nhanh ở list */
  canConfirm(o: OrderListItemDto): boolean {
    return o.status === 'DELIVERED';
  }

  confirm(o: OrderListItemDto): void {
    if (!confirm('Xác nhận: Tôi đã nhận hàng?')) return;
    this.api.confirmReceived(o.id).subscribe({
      next: (d) => {
        o.status = d.status;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  canCancel(o: OrderListItemDto): boolean {
    return o.status === 'PENDING_PAYMENT';
  }

  cancel(o: OrderListItemDto): void {
    if (!confirm('Bạn muốn hủy đơn này?')) return;
    this.api.cancel(o.id).subscribe({
      next: (d) => {
        o.status = d.status;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }
}
