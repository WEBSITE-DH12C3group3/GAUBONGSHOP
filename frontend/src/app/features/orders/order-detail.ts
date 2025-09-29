import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import {
  OrderClientService,
  OrderDetailDto,
  OrderStatus,
} from '../../shared/services/order-client.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, DecimalPipe, NgClass],
  templateUrl: './order-detail.html',
})
export class OrderDetailComponent implements OnInit {
  id!: number;
  loading = false;
  order?: OrderDetailDto;

  readonly steps: { key: OrderStatus; label: string }[] = [
    { key: 'PENDING_PAYMENT', label: 'Chờ duyệt' },
    { key: 'PACKING', label: 'Chuẩn bị hàng' },
    { key: 'SHIPPED', label: 'Đã gửi' },
    { key: 'DELIVERED', label: 'Đã giao' },
    { key: 'PAID', label: 'Đã thanh toán' },
  ];

  constructor(
    private route: ActivatedRoute,
    private api: OrderClientService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.detail(this.id).subscribe({
      next: (d) => {
        this.order = d;
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

  stepIndex(): number {
    const map = ['PENDING_PAYMENT', 'PACKING', 'SHIPPED', 'DELIVERED', 'PAID'] as OrderStatus[];
    const idx = this.order ? map.indexOf(this.order.status) : 0;
    return Math.max(0, idx);
  }

  canConfirm(): boolean {
    return this.order?.status === 'DELIVERED';
  }

  confirm(): void {
    if (!this.order) return;
    if (!confirm('Xác nhận: Tôi đã nhận hàng?')) return;
    this.api.confirmReceived(this.order.id).subscribe({
      next: (d) => {
        this.order = d;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  canCancel(): boolean {
    return this.order?.status === 'PENDING_PAYMENT';
  }

  cancel(): void {
    if (!this.order) return;
    if (!confirm('Bạn muốn hủy đơn này?')) return;
    this.api.cancel(this.order.id).subscribe({
      next: (d) => {
        this.order = d;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }
}
