import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { CategoryService } from '../../shared/services/category.service';
import { ProductService } from '../../shared/services/product.service';
import { FavoriteService } from '../../shared/services/favorite.service';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, HeaderComponent, FooterComponent, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  featuredCategories: Category[] = [];
  categoriesWithProducts: any[] = [];
  newProducts: Product[] = [];
  isLoading = true;

  /** Yêu thích */
  isFavoriteProducts: { [productId: number]: boolean } = {};

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFeaturedCategories();
    this.loadCategoriesWithProducts();
    this.loadNewProducts();
    this.loadFavorites();
  }

  /** Danh mục nổi bật */
  loadFeaturedCategories() {
    this.categoryService.getFeaturedCategories().subscribe({
      next: (categories) => {
        this.featuredCategories = categories;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục nổi bật:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Danh mục + sản phẩm */
  loadCategoriesWithProducts() {
    this.categoryService.getFeaturedCategories().subscribe({
      next: (categories) => {
        const requests = categories.map(cat =>
          this.productService.getProductsByCategory(cat.id, 0, 8)
        );

        forkJoin(requests).subscribe((results) => {
          this.categoriesWithProducts = categories
            .map((cat, i) => ({
              ...cat,
              products: results[i].items ?? []
            }))
            .filter(cat => cat.products.length > 0);

          // ✅ check favorite cho từng sản phẩm
          this.categoriesWithProducts.forEach(cat => {
            cat.products.forEach((p: Product) => {
              this.favoriteService.isFavorite(p.id).subscribe({
                next: (exists: boolean) => (this.isFavoriteProducts[p.id] = exists),
                error: () => (this.isFavoriteProducts[p.id] = false)
              });
            });
          });

          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Lỗi khi tải danh mục + sản phẩm:', err)
    });
  }

  /** Sản phẩm mới nhất */
  loadNewProducts() {
    this.productService.getNewProducts(8).subscribe({
      next: (response) => {
        this.newProducts = response.items || [];

        // ✅ check favorite cho new products
        this.newProducts.forEach((p) => {
          this.favoriteService.isFavorite(p.id).subscribe({
            next: (exists: boolean) => (this.isFavoriteProducts[p.id] = exists),
            error: () => (this.isFavoriteProducts[p.id] = false)
          });
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi khi tải sản phẩm mới:', error);
        this.cdr.detectChanges();
      }
    });
  }

  /** Lấy tất cả favorites */
  loadFavorites() {
    this.favoriteService.getFavorites().subscribe({
      next: (data) => {
        // data có thể là số[] (session) hoặc object[]
        data.forEach((f: any) => {
          const pid = typeof f === 'number' ? f : f.productId;
          this.isFavoriteProducts[pid] = true;
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi khi tải favorites:', err)
    });
  }

  /** Kiểm tra sản phẩm có yêu thích không */
  isFavorite(productId: number): boolean {
    return !!this.isFavoriteProducts[productId];
  }

  /** Thêm / xóa yêu thích */
  toggleFavorite(productId: number, event: MouseEvent): void {
    event.stopPropagation();

    const current = this.isFavoriteProducts[productId] || false;
    this.isFavoriteProducts[productId] = !current; // cập nhật UI ngay

    if (!current) {
      this.favoriteService.addFavorite(productId).subscribe({
        next: () => console.log('Đã thêm vào yêu thích'),
        error: (err) => {
          console.error('Lỗi khi thêm favorite:', err);
          this.isFavoriteProducts[productId] = current; // rollback nếu lỗi
        }
      });
    } else {
      this.favoriteService.removeFavorite(productId).subscribe({
        next: () => console.log('Đã bỏ yêu thích'),
        error: (err) => {
          console.error('Lỗi khi xóa favorite:', err);
          this.isFavoriteProducts[productId] = current; // rollback nếu lỗi
        }
      });
    }
  }

  /** 🎨 Màu cho danh mục */
  private categoryColors = [
    { bg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-600 hover:text-blue-700' },
    { bg: 'bg-pink-100', icon: 'text-pink-600', text: 'text-pink-600 hover:text-pink-700' },
    { bg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-600 hover:text-green-700' },
    { bg: 'bg-yellow-100', icon: 'text-yellow-600', text: 'text-yellow-600 hover:text-yellow-700' },
    { bg: 'bg-purple-100', icon: 'text-purple-600', text: 'text-purple-600 hover:text-purple-700' },
    { bg: 'bg-orange-100', icon: 'text-orange-600', text: 'text-orange-600 hover:text-orange-700' },
    { bg: 'bg-teal-100', icon: 'text-teal-600', text: 'text-teal-600 hover:text-teal-700' },
    { bg: 'bg-red-100', icon: 'text-red-600', text: 'text-red-600 hover:text-red-700' }
  ];

  private categoryHeaderColors = [
    { bg: 'bg-blue-200', text: 'text-blue-800' },
    { bg: 'bg-pink-200', text: 'text-pink-800' },
    { bg: 'bg-green-200', text: 'text-green-800' },
    { bg: 'bg-yellow-200', text: 'text-yellow-800' },
    { bg: 'bg-purple-200', text: 'text-purple-800' },
    { bg: 'bg-orange-200', text: 'text-orange-800' },
    { bg: 'bg-teal-200', text: 'text-teal-800' },
    { bg: 'bg-red-200', text: 'text-red-800' }
  ];

  getCategoryColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length].bg;
  }
  getCategoryIconColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length].icon;
  }
  getCategoryTextColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length].text;
  }
  getCategoryHeaderColor(index: number): string {
    return this.categoryHeaderColors[index % this.categoryHeaderColors.length].bg;
  }
  getCategoryHeaderTextColor(index: number): string {
    return this.categoryHeaderColors[index % this.categoryHeaderColors.length].text;
  }
}
