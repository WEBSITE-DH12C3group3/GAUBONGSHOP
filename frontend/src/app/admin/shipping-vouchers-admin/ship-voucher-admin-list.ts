import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ShipVoucherAdminService } from '../../shared/services/ship-voucher-admin.service';
import { ShipVoucher } from '../../models/ship-voucher.model';

@Component({
  standalone: true,
  selector: 'app-ship-voucher-admin-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ship-voucher-admin-list.html'
})
export class ShipVoucherAdminListComponent {
  private api = inject(ShipVoucherAdminService);

  q = signal('');
  page = signal(0);
  size = signal(10);
  sort = signal<'id,desc' | 'code,asc' | 'startDate,desc'>('id,desc');
  loading = signal(false);

  items = signal<ShipVoucher[]>([]);
  totalPages = signal(1);
  pageDisplay = computed(() => this.page() + 1);

  constructor() { effect(() => this.fetch()); }

  fetch() {
    this.loading.set(true);
    this.api.list(this.q(), this.page(), this.size(), this.sort()).subscribe({
      next: res => { this.items.set(res.items); this.totalPages.set(res.totalPages || 1); this.loading.set(false); },
      error: _ => this.loading.set(false)
    });
  }

  search() { this.page.set(0); this.fetch(); }
  onChangeSort() { this.page.set(0); this.fetch(); }
  prev() { if (this.page() > 0) { this.page.set(this.page() - 1); this.fetch(); } }
  next() { if (this.page() + 1 < this.totalPages()) { this.page.set(this.page() + 1); this.fetch(); } }

  toggleActive(v: ShipVoucher) {
    const next = !v.active;
    this.api.setActive(v.id, next).subscribe({
      next: updated => this.items.set(this.items().map(it => it.id === updated.id ? updated : it)),
      error: err => alert(err?.error?.error || 'Không thể đổi trạng thái')
    });
  }

  confirmDelete(id: number) {
    if (!confirm('Xoá phiếu vận chuyển này?')) return;
    this.api.delete(id).subscribe({ next: _ => this.fetch() });
  }
}
