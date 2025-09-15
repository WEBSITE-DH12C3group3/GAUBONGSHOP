
import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Category } from '../../models/category.model';
import { CategoryAdminService } from '../../shared/services/category_admin.service';

@Component({
  selector: 'app-categories-admin-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './categories-admin-list.component.html'
})
export class CategoriesAdminListComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  page = 0;
  totalPages = 0;
  pages: number[] = []; // 👈 thêm mảng trang

  constructor(
    private categoryService: CategoryAdminService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCategories();
    }
  }

  loadCategories(page: number = 0) {
    this.loading = true;
    this.categoryService.getAll(page).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        console.log("✅ API response:", data);
        this.categories = data.content ?? data.items ?? [];
        this.page = data.number;
        this.totalPages = data.totalPages;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i); // 👈 tạo mảng số trang
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Lỗi load categories:', err);
        this.cdr.detectChanges();
      }
    });
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadCategories(newPage);
    }
  }

  deleteCategory(id: number) {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      this.categoryService.delete(id).subscribe(() => {
        this.loadCategories(this.page);
      });
    }
  }
}