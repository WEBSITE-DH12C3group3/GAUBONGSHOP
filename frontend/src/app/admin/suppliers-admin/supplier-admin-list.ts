import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupplierAdminService } from '../../shared/services/supplier-admin.service';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './supplier-admin-list.html'
})
export class SupplierAdminListComponent {
  private api = inject(SupplierAdminService);

  q = signal('');
  page = signal(0);
  size = signal(10);
  sort = signal('id,desc');
  loading = signal(false);

  items = signal<Supplier[]>([]);
  totalPages = signal(1);
  pageDisplay = computed(() => this.page() + 1);

  constructor() { effect(() => this.fetch()); }

  fetch() {
    this.loading.set(true);
    this.api.list(this.q(), this.page(), this.size(), this.sort()).subscribe({
      next: res => {
        this.items.set(res.items);
        this.totalPages.set(res.totalPages || 1);
        this.loading.set(false);
      },
      error: _ => this.loading.set(false)
    });
  }

  search() { this.page.set(0); this.fetch(); }
  onChangeSort() { this.page.set(0); this.fetch(); }
  prev() { if (this.page() > 0) { this.page.set(this.page() - 1); this.fetch(); } }
  next() { if (this.page() + 1 < this.totalPages()) { this.page.set(this.page() + 1); this.fetch(); } }

  confirmDelete(id: number) {
    if (!confirm('Xoá nhà cung cấp này?')) return;
    this.api.delete(id).subscribe({ next: _ => this.fetch() });
  }
}
