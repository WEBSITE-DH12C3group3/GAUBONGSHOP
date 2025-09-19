// src/app/features/products/products.component.ts
import { Component, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../shared/services/product.service';
import { CategoryService } from '../../shared/services/category.service';
import { environment } from '../../../environments/environment';

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  categoryId?: number | null;
  createdAt?: string | null;
  rating?: number | null;
  isNew?: boolean | null;
  description?: string | null;

  reviewCount?: number | null;

};

type Category = { id: number; name: string };

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CurrencyPipe],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class ProductsComponent implements OnInit {
  // Data
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: Category | null = null;

  // State
  categoryId: number | null = null;
  isLoading = true;
  viewMode: 'grid' | 'list' = 'grid';
  showSortDropdown = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;

  // Filters
  selectedCategories: number[] = [];
  selectedPriceRange: string | null = null; // e.g. "100000-500000" | "1000000+"
  selectedRating: number | null = null;

  // Sort
  currentSort: 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' = 'newest';
  sortOptions = [
    { value: 'newest', text: 'Mới nhất' },
    { value: 'price-asc', text: 'Giá: Thấp đến cao' },
    { value: 'price-desc', text: 'Giá: Cao đến thấp' },
    { value: 'name-asc', text: 'Tên: A-Z' },
    { value: 'name-desc', text: 'Tên: Z-A' },
  ] as const;

  priceRanges = [
    { id: '0-100000', label: 'Dưới 100.000₫' },
    { id: '100000-500000', label: '100.000₫ - 500.000₫' },
    { id: '500000-1000000', label: '500.000₫ - 1.000.000₫' },
    { id: '1000000+', label: 'Trên 1.000.000₫' },
  ];

  // Image helpers
  private apiBase = (environment as any).apiBase ?? 'http://localhost:8080';
  private fallbackImg = 'https://placehold.co/480x360?text=No+Image';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  // ========== Lifecycle ==========
  ngOnInit(): void {
    this.loadCategories();

    const sub = this.route.queryParams.subscribe((params) => {
      this.categoryId = params['category'] ? Number(params['category']) : null;
      // Đồng bộ selectedCategory filter khi có query
      if (this.categoryId && !this.selectedCategories.includes(this.categoryId)) {
        this.selectedCategories = [this.categoryId];
      }
      this.loadProducts();
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  // ========== Data load ==========
  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res: any) => {
        // API bạn trả về { content: Category[] } theo code cũ
        this.categories = (res?.content as Category[]) ?? [];
        if (this.categoryId) {
          this.selectedCategory =
            this.categories.find((c) => c.id === this.categoryId) ?? null;
          if (this.selectedCategory && !this.selectedCategories.length) {
            this.selectedCategories = [this.selectedCategory.id];
          }
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải danh mục:', err);
        this.categories = [];
      },
    });
  }

  private loadProducts(): void {
    this.isLoading = true;

    const done = () => {
      this.isLoading = false;
      this.cdr.detectChanges();
    };

    // Nếu có categoryId -> load theo danh mục; ngược lại -> tất cả
    const obs = this.categoryId
      ? this.productService.getProductsByCategory(this.categoryId, 0)
      : this.productService.getAllProducts();

    obs.subscribe({
      next: (res: any) => {
        this.products = (res?.items as Product[]) ?? [];
        this.applyFilters(true);
        done();
      },
      error: (err) => {
        console.error('Lỗi khi tải sản phẩm:', err);
        this.products = [];
        this.applyFilters(true);
        done();
      },
    });
  }

  // ========== Filters / Sort / Paging ==========
  /** Tính toán lại list theo filter & sort; reset trang nếu vừa đổi filter */
  private applyFilters(resetPage = false): void {
    let list = [...this.products];

    // Category filter
    if (this.selectedCategories.length > 0) {
      const set = new Set(this.selectedCategories);
      list = list.filter((p) => (p.categoryId ?? null) !== null && set.has(p.categoryId!));
    }

    // Price filter
    if (this.selectedPriceRange) {
      const [minStr, maxStr] = this.selectedPriceRange.split('-');
      const min = parseInt(minStr, 10);
      const max = maxStr === '+' ? Number.POSITIVE_INFINITY : parseInt(maxStr, 10);
      list = list.filter((p) => {
        const price = Number(p.price || 0);
        return price >= min && price <= max;
      });
    }

    // Rating filter
    if (this.selectedRating) {
      list = list.filter((p) => Number(p.rating ?? 4) >= (this.selectedRating as number));
    }

    // Sort
    switch (this.currentSort) {
      case 'newest': {
        list.sort(
          (a, b) =>
            (new Date(b.createdAt || 0).getTime() || 0) -
            (new Date(a.createdAt || 0).getTime() || 0)
        );
        break;
      }
      case 'price-asc':
        list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'price-desc':
        list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'name-asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
    }

    this.filteredProducts = list;

    // Pagination
    if (resetPage) this.currentPage = 1;
    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
    this.updatePaginatedProducts();
  }

  private updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // ========== Pagination actions ==========
  setPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedProducts();
    this.scrollToTop();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
      this.scrollToTop();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
      this.scrollToTop();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  private scrollToTop(): void {
    // tránh lỗi SSR
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ========== Filter actions ==========
  toggleCategoryFilter(categoryId: number): void {
    const i = this.selectedCategories.indexOf(categoryId);
    if (i > -1) this.selectedCategories.splice(i, 1);
    else this.selectedCategories.push(categoryId);
    this.applyFilters(true);
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  selectPriceRange(rangeId: string): void {
    this.selectedPriceRange = rangeId;
    this.applyFilters(true);
  }

  selectRating(rating: number): void {
    this.selectedRating = rating;
    this.applyFilters(true);
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.selectedPriceRange = null;
    this.selectedRating = null;
    this.applyFilters(true);
  }

  // ========== Sort actions ==========
  toggleSortDropdown(): void {
    this.showSortDropdown = !this.showSortDropdown;
  }

  changeSort(sortValue: ProductsComponent['currentSort']): void {
    this.currentSort = sortValue;
    this.showSortDropdown = false;
    this.applyFilters(false);
  }

  getSortOptionText(): string {
    const option = this.sortOptions.find((o) => o.value === this.currentSort);
    return option ? option.text : 'Mới nhất';
  }

  // ========== View ==========
  changeViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // ========== Template helpers ==========
  getStarsArray(rating: number): string[] {
    const stars: string[] = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    for (let i = 0; i < full; i++) stars.push('fas fa-star');
    if (half) stars.push('fas fa-star-half-alt');
    while (stars.length < 5) stars.push('far fa-star');

    return stars;
  }

  /** Chuẩn hoá URL ảnh: nếu path tương đối => ghép với apiBase; nếu lỗi => trả về fallback */
  imgUrl(path?: string | null): string {
    if (!path || !`${path}`.trim()) return this.fallbackImg;
    const clean = `${path}`.trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    const joined = clean.startsWith('/') ? clean : `/${clean}`;
    return this.apiBase.replace(/\/$/, '') + joined;
  }

  /** Bắt sự kiện lỗi ảnh, set về fallback (tránh loop) */
  onImgErr(ev: Event): void {
    const img = ev?.target as HTMLImageElement | null;
    if (!img) return;

    const ds = img.dataset as DOMStringMap;
    if (ds['fallback'] === '1') return;   // đã gán fallback rồi thì thôi

    ds['fallback'] = '1';                 // đánh dấu để tránh lặp vô hạn
    img.src = this.fallbackImg;           // ảnh thay thế
  }

}
