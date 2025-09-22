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
import { CartService } from '../../shared/services/cart.service';

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
    private cdr: ChangeDetectorRef,
    private cartService: CartService
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
  /** ====== ADD TO CART + FLY EFFECT ====== */
  addToCart(p: { id: number; imageUrl?: string }, ev?: MouseEvent, fromImgEl?: HTMLImageElement) {
    if (!p?.id) return;

    // 1) Hiệu ứng bay vào giỏ (chạy ngay)
    const imgUrl = this.getImgUrl(p);
    this.flyToCart(ev, fromImgEl, imgUrl);

    // 2) Gọi API thêm giỏ như cũ
    this.cartService.add(p.id, 1).subscribe({
      next: () => {
        // bắn event nếu bạn muốn badge cập nhật (không bắt buộc)
        // window.dispatchEvent(new CustomEvent('CartUpdated', { detail: { delta: 1, productId: p.id } }));
      },
      error: (err) => console.error('Không thêm được vào giỏ:', err)
    });
  }

  /** Lấy URL ảnh hiển thị (đã thấy bạn đang build 'http://localhost:8080' + imageUrl) */
  private getImgUrl(p: any): string | undefined {
    if (!p) return undefined;
    if (p.imageUrl?.startsWith('http')) return p.imageUrl;
    if (p.imageUrl) return 'http://localhost:8080' + p.imageUrl;
    return undefined;
  }

  /** Hiệu ứng bay vào giỏ */
  private flyToCart(ev?: MouseEvent, fromImgEl?: HTMLImageElement, fallbackImgUrl?: string) {
    try {
      // target: ưu tiên phần tử gắn data-cart-target (nếu bạn thêm), sau đó link cart, rồi icon
      const target =
        document.querySelector('[data-cart-target]') ||
        document.querySelector('a[routerLink="/cart"]') ||
        document.querySelector('.fa-shopping-cart') ||
        document.body;

      const targetRect = (target as HTMLElement).getBoundingClientRect();

      // nguồn: ưu tiên ảnh trong card gần nút; nếu không có thì dùng fallback
      let srcImg: HTMLImageElement | null = fromImgEl || null;
      if (!srcImg && ev?.target) {
        const btn = (ev.target as HTMLElement).closest('.product-card') as HTMLElement | null;
        if (btn) srcImg = btn.querySelector('img');
      }

      const startRect = srcImg?.getBoundingClientRect();
      const imgSrc = srcImg?.src || fallbackImgUrl;
      if (!imgSrc || !startRect) return;

      // tạo ảnh bay
      const flyer = document.createElement('img');
      flyer.src = imgSrc;
      flyer.style.position = 'fixed';
      flyer.style.left = startRect.left + 'px';
      flyer.style.top = startRect.top + 'px';
      flyer.style.width = startRect.width + 'px';
      flyer.style.height = startRect.height + 'px';
      flyer.style.borderRadius = '12px';
      flyer.style.zIndex = '9999';
      flyer.style.pointerEvents = 'none';
      flyer.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
      document.body.appendChild(flyer);

      // tính toán điểm đích (hơi lệch vào giữa badge)
      const endX = targetRect.left + targetRect.width * 0.7;
      const endY = targetRect.top + targetRect.height * 0.3;

      // animate: bay + thu nhỏ + mờ dần
      const keyframes = [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${endX - startRect.left}px, ${endY - startRect.top}px) scale(0.2)`, opacity: 0.4 }
      ];
      const anim = flyer.animate(keyframes, { duration: 600, easing: 'cubic-bezier(.3,.7,.4,1)' });

      anim.onfinish = () => {
        flyer.remove();
        // cart pulse nhẹ
        const t = target as HTMLElement;
        t.classList.add('cart-pulse');
        setTimeout(() => t.classList.remove('cart-pulse'), 300);
      };
    } catch {
      /* bỏ qua mọi lỗi để không ảnh hưởng UX */
    }
  }

  // ===== màu & helper giữ nguyên =====
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
