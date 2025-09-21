import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoriteService } from '../../shared/services/favorite.service';
import { AuthService } from '../../shared/services/auth.service';
import { ProductService } from '../../shared/services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.html'
})
export class WishlistComponent implements OnInit {
  favorites: Product[] = [];
  isLoading = true;
  currentUserId: number | null = null;

  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef   // ✅ thêm ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.currentUserId = user ? user.id : null;
    this.loadFavorites();
  }

  /** Lấy danh sách yêu thích */
  loadFavorites() {
    this.isLoading = true;
    console.log('[Wishlist] Gọi getFavorites...');

    this.favoriteService.getFavorites().subscribe({
      next: (favs) => {
        console.log('[Wishlist] API trả về:', favs);

        const productIds = favs.map((f: any) =>
          typeof f === 'number' ? f : f.productId
        );
        console.log('[Wishlist] productIds:', productIds);

        if (productIds.length > 0) {
          this.productService.getProductsByIds(productIds).subscribe({
            next: (products: Product[]) => {
              console.log('[Wishlist] Products:', products);
              this.favorites = products;
              this.isLoading = false;
              this.cdr.detectChanges();  // ✅ cập nhật UI
            },
            error: (err) => {
              console.error('[Wishlist] Lỗi khi load products:', err);
              this.favorites = [];
              this.isLoading = false;
              this.cdr.detectChanges();  // ✅ cập nhật UI
            }
          });
        } else {
          console.log('[Wishlist] Không có productId');
          this.favorites = [];
          this.isLoading = false;
          this.cdr.detectChanges();  // ✅ cập nhật UI
        }
      },
      error: (err) => {
        console.error('[Wishlist] Lỗi khi load favorites:', err);
        this.favorites = [];
        this.isLoading = false;
        this.cdr.detectChanges();  // ✅ cập nhật UI
      }
    });
  }

  /** Xóa sản phẩm khỏi danh sách yêu thích */
  removeFavorite(productId: number) {
    this.favoriteService.removeFavorite(productId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(p => p.id !== productId);
        this.cdr.detectChanges();  // ✅ cập nhật UI ngay sau khi xóa
      },
      error: (err) => {
        console.error('Lỗi khi xóa khỏi yêu thích:', err);
      }
    });
  }
}
