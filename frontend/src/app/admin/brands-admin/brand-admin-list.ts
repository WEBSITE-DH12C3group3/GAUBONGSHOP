import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BrandAdminService } from '../../shared/services/brand-admin.service';
import { Brand } from '../../models/brand.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-brands-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './brand-admin-list.html'
})
export class BrandsAdminListComponent {
  private api = inject(BrandAdminService);

  // ====== State ======
  q = signal('');
  page = signal(0);
  size = signal(10);
  sort = signal<'id,desc' | 'id,asc' | 'name,asc' | 'name,desc'>('id,desc');
  loading = signal(false);

  items = signal<Brand[]>([]);
  totalPages = signal(1);

  pageDisplay = computed(() => this.page() + 1);

  // ====== Lifecycle ======
  constructor() {
    // Tự fetch khi q/page/size/sort thay đổi (nếu muốn fetch "chủ động" hơn, gọi fetch() thủ công)
    effect(() => {
      // đọc giá trị để tạo dependency
      this.q(); this.page(); this.size(); this.sort();
      this.fetch();
    });
  }

  // ====== Data fetch ======
  fetch() {
    this.loading.set(true);
    this.api.listPaged(this.q(), this.page(), this.size(), this.sort()).subscribe({
      next: (res) => {
        // Chuẩn hoá theo Page response của backend:
        // { content, number, size, totalElements, totalPages }
        this.items.set(res.content ?? []);
        this.page.set(res.number ?? 0);
        this.totalPages.set(res.totalPages ?? 1);
        this.loading.set(false);
      },
      error: _ => this.loading.set(false)
    });
  }

  // ====== Actions ======
  search() { this.page.set(0); this.fetch(); }
  onChangeSort() { this.page.set(0); this.fetch(); }
  prev() { if (this.page() > 0) { this.page.set(this.page() - 1); this.fetch(); } }
  next() { if (this.page() + 1 < this.totalPages()) { this.page.set(this.page() + 1); this.fetch(); } }

  confirmDelete(id: number) {
    if (!confirm('Xoá thương hiệu này?')) return;
    this.api.delete(id).subscribe({ next: _ => this.fetch() });
  }

  // ====== URL helpers ======
  // Lấy origin thật sự của backend từ environment.apiUrl (ví dụ 'http://localhost:8080/api' -> 'http://localhost:8080')
  private backendOrigin(): string {
    try { return new URL(environment.apiUrl).origin; } catch { return location.origin; }
  }

  private toAbsUrl(input?: string | null): string | null {
    if (!input) return null;
    let u = input.trim();
    if (!u) return null;

    // Nếu đã absolute -> chuẩn hoá // rồi trả
    if (/^https?:\/\//i.test(u)) {
      return u.replace(/(?<!:)\/{2,}/g, '/'); // gộp // (không phá http://)
    }

    // Chuẩn hoá: /Brandimg -> /brandimg
    u = u.replace(/^\/Brandimg\//, '/brandimg/');

    // Nếu vô tình bị lặp '/brandimg//brandimg/' -> giữ 1 cái
    u = u.replace(/^\/+brandimg\/+brandimg\//, '/brandimg/');

    // Gộp / thừa (nhưng vẫn giữ đầu /)
    u = ('/' + u.replace(/^\/+/, '')).replace(/\/{2,}/g, '/');

    // Bỏ /api nếu có dính (VD từ copy sai)
    u = u.replace(/^\/api(\/|$)/, '/');

    const origin = this.backendOrigin().replace(/\/+$/, '');
    return `${origin}${u}`;
  }

  // ====== Template helpers ======
  logoOf(b: Brand): string | null {
    const raw = (b.logoUrl ?? (b as any).logo_url) as string | undefined;
    return this.toAbsUrl(raw);
  }

  websiteOf(b: Brand): string | null {
    const raw = (b.websiteUrl ?? (b as any).website_url) as string | undefined;
    return raw?.trim() || null;
  }
}
