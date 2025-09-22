import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { AdminOrderService } from '../../shared/services/admin-order.service';
import { OrderResponse, OrderStatus } from '../../models/order.model';

export interface Page<T> {
  content?: T[];
  items?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIf, NgFor, CurrencyPipe, DatePipe],
  templateUrl: './orders-admin.html',
  styleUrl: './orders-admin.css'
})
export class OrdersAdminPage implements OnInit {
  private api = inject(AdminOrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // 👉 thêm để chủ động tick
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  orderId?: number;

  // list state
  statusFilter = '';
  page = 0;
  size = 20;
  data?: Page<OrderResponse>;

  // detail state
  detail?: OrderResponse;
  updating = false;

  // Render ngay cả khi chưa có dữ liệu
  get items(): OrderResponse[] {
    const d: any = this.data;
    return (d?.content ?? d?.items ?? []) as OrderResponse[];
  }

  ngOnInit() {
    this.route.paramMap.subscribe(pm => {
      const raw = pm.get('id');
      this.orderId = raw ? +raw : undefined;
      if (this.orderId) {
        this.loadDetail(this.orderId);
      } else {
        this.loadList();
      }
      // đảm bảo tick khi thay đổi view mode
      this.cdr.markForCheck();
    });
  }

  loadList() {
    this.api.list(this.statusFilter, this.page, this.size).subscribe({
      next: d => {
        // chạy trong zone + tick ngay
        this.zone.run(() => {
          this.data = d;
          this.cdr.markForCheck();
        });
      }
    });
  }

  loadDetail(id: number) {
    this.detail = undefined;
    this.cdr.markForCheck();
    this.api.detail(id).subscribe({
      next: d => {
        this.zone.run(() => {
          this.detail = d;
          this.cdr.markForCheck();
        });
      }
    });
  }

  applyFilter() {
    this.page = 0;
    this.loadList();
  }

  // vẫn giữ phòng hờ
  gotoDetail(o: OrderResponse) {
    this.router.navigate(['/admin/orders', o.id]);
  }

  backToList() {
    this.router.navigate(['/admin/orders']);
  }

  updateStatus(st: OrderStatus) {
    if (!this.detail) return;
    this.updating = true;
    this.api.updateStatus(this.detail.id, st).subscribe({
      next: d => {
        this.zone.run(() => {
          this.detail = d;
          this.updating = false;
          this.cdr.markForCheck();
        });
      },
      error: _ => {
        this.zone.run(() => {
          this.updating = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  nextPage() { this.page++; this.loadList(); }
  prevPage() { this.page = Math.max(0, this.page - 1); this.loadList(); }
}
