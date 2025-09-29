import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';

import { OrderV2Service } from '../../shared/services/order-v2.service';
import { OrderListItemDto, OrderDetailDto, OrderStatus, Page } from '../../models/order-v2.model';

type StatusFilter = '' | OrderStatus;

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './orders-admin.html',
  styleUrls: ['./orders-admin.css'] // nếu bạn có; còn không có thì vẫn OK
})
export class OrdersAdminComponent implements OnInit {
  // ==== Paging & data ====
  pageData?: Page<OrderListItemDto>;
  rows: OrderListItemDto[] = [];
  loading = false;

  page = 0;
  size = 20;

  // ==== Filters ====
  status: StatusFilter = '';
  q = '';
  province = '';
  carrierCode = '';
  dateFrom = ''; // yyyy-MM-dd
  dateTo = '';
  minTotal?: number;
  maxTotal?: number;

  // ==== Detail ====
  showDetail = false;
  detailLoading = false;
  selected?: OrderDetailDto;

  // Trạng thái gốc (enum backend)
  readonly statuses: OrderStatus[] = [
    'PENDING_PAYMENT','PAID','PACKING','SHIPPED','DELIVERED','CANCELED'
  ];

  // Map -> nhãn tiếng Việt
  private readonly viLabelMap: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'Chờ duyệt / Chưa thanh toán',
    PAID:            'Đã thanh toán',
    PACKING:         'Đang chuẩn bị hàng',
    SHIPPED:         'Đã gửi hàng',
    DELIVERED:       'Đã giao',
    CANCELED:        'Đã hủy'
  };
  statusHint(s: OrderStatus | undefined): string | null {
    if (s === 'DELIVERED') return 'Chờ thanh toán';
    return null; // các trạng thái khác không có hint
  }

  // Options cho combobox trạng thái (hiển thị TV)
  readonly statusOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: '',                 label: 'Tất cả trạng thái' },
    { value: 'PENDING_PAYMENT',  label: this.viLabelMap.PENDING_PAYMENT },
    { value: 'PAID',             label: this.viLabelMap.PAID },
    { value: 'PACKING',          label: this.viLabelMap.PACKING },
    { value: 'SHIPPED',          label: this.viLabelMap.SHIPPED },
    { value: 'DELIVERED',        label: this.viLabelMap.DELIVERED },
    { value: 'CANCELED',         label: this.viLabelMap.CANCELED }
  ];

  constructor(private api: OrderV2Service) {}

  ngOnInit(): void { this.fetch(); }

  // ====== LOAD LIST ======
  fetch(): void {
    this.loading = true;
    const hasAdvanced =
      this.q || this.province || this.carrierCode || this.dateFrom || this.dateTo ||
      this.minTotal != null || this.maxTotal != null;

    const obs = hasAdvanced
      ? this.api.search({
          status: this.status || undefined,
          q: this.q || undefined,
          province: this.province || undefined,
          carrierCode: this.carrierCode || undefined,
          dateFrom: this.dateFrom || undefined,
          dateTo: this.dateTo || undefined,
          minTotal: this.minTotal,
          maxTotal: this.maxTotal,
          page: this.page, size: this.size
        })
      : (this.status
          ? this.api.listByStatus(this.status, this.page, this.size)
          : this.api.listAll(this.page, this.size));

    obs.subscribe({
      next: res => { this.pageData = res; this.rows = res.content; },
      error: _ => { this.rows = []; },
      complete: () => this.loading = false
    });
  }

  resetFilters(): void {
    this.status = '';
    this.q = '';
    this.province = '';
    this.carrierCode = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.minTotal = undefined;
    this.maxTotal = undefined;
    this.page = 0;
    this.fetch();
  }

  goPage(p: number): void {
    if (!this.pageData) return;
    if (p < 0 || p >= this.pageData.totalPages) return;
    this.page = p;
    this.fetch();
  }

  // ====== DETAIL ======
  openDetail(row: OrderListItemDto): void {
    this.detailLoading = true;
    this.showDetail = true;
    this.selected = undefined;
    this.api.detail(row.id).subscribe({
      next: d => this.selected = d,
      complete: () => this.detailLoading = false
    });
  }
  closeDetail(): void {
    this.showDetail = false;
    this.selected = undefined;
  }

    // ====== STATUS FLOW ======
  nextAllowed(status: OrderStatus): OrderStatus[] {
    // Luồng mới:
    // PENDING_PAYMENT -> PACKING -> SHIPPED -> DELIVERED
    // PAID & CANCELED là kết thúc; Admin không tự đẩy sang PAID (đợi khách xác nhận)
    const map: Record<OrderStatus, OrderStatus[]> = {
      PENDING_PAYMENT: ['PACKING','CANCELED'], // duyệt -> chuẩn bị hàng
      PAID:            [],                     // đã thanh toán (cuối luồng)
      PACKING:         ['SHIPPED','CANCELED'], // chuẩn bị xong -> gửi
      SHIPPED:         ['DELIVERED','CANCELED'], // đã gửi -> đã giao
      DELIVERED:       [],                     // chờ khách xác nhận để thành PAID
      CANCELED:        []
    };
    return map[status];
  }


  setStatus(row: OrderListItemDto, target: OrderStatus): void {
    const targetLabel = this.statusLabel(target);
    if (!confirm(`Xác nhận chuyển trạng thái đơn #${row.id} → ${targetLabel}?`)) return;
    this.api.updateStatus(row.id, target).subscribe({
      next: d => {
        const idx = this.rows.findIndex(x => x.id === row.id);
        if (idx >= 0) this.rows[idx].status = d.status;
        if (this.selected?.id === row.id) this.selected.status = d.status;
      }
    });
  }

  cancel(row: OrderListItemDto): void {
    if (!confirm(`Xác nhận HỦY đơn #${row.id}?`)) return;
    this.api.cancel(row.id).subscribe({
      next: d => {
        const idx = this.rows.findIndex(x => x.id === row.id);
        if (idx >= 0) this.rows[idx].status = d.status;
        if (this.selected?.id === row.id) this.selected.status = d.status;
      }
    });
  }

  // ====== Export CSV (nhãn TV) ======
  exportCsv(): void {
    const header = [
      'ID','Ngày tạo','Người nhận','Điện thoại','Địa chỉ','Tỉnh/TP',
      'Hàng','Ship','Giảm ship','Tổng','Trạng thái'
    ];
    const lines = this.rows.map(r => {
      const label = this.statusLabel(r.status);
      const hint  = this.statusHint(r.status);
      return ([
        r.id,
        new Date(r.orderDate).toLocaleString(),
        this.csv(r.receiverName),
        '\u200B' + r.phone,
        this.csv(r.addressLine),
        this.csv(r.province),
        r.itemsTotal,
        r.shippingFee,
        r.shippingDiscount,
        r.grandTotal,
        hint ? `${label} ( ${hint} )` : label
      ].join(','));
    });
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ====== Helpers ======
  statusLabel(s: OrderStatus | undefined): string {
    if (!s) return this.viLabelMap.PENDING_PAYMENT;
    return this.viLabelMap[s] ?? s;
  }

  /** Trả về class Tailwind thay đổi màu badge theo trạng thái */
  chipClass(status: OrderStatus | undefined): string {
    const s = status ?? 'PENDING_PAYMENT';
    const map: Record<OrderStatus,string> = {
      PENDING_PAYMENT: 'bg-amber-50 text-amber-700 ring-amber-200',
      PAID:            'bg-sky-50   text-sky-700   ring-sky-200',
      PACKING:         'bg-indigo-50 text-indigo-700 ring-indigo-200',
      SHIPPED:         'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
      DELIVERED:       'bg-stone-50 text-stone-700 ring-stone-200', // 👈 trung tính
      CANCELED:        'bg-rose-50  text-rose-700  ring-rose-200'
    };

    return map[s];
  }

  private csv(s: string): string {
    if (s == null) return '';
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g,'""')}"`;
    }
    return s;
  }
}
