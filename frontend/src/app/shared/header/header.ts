// FILE: src/app/layout/components/header/header.ts
import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  PLATFORM_ID,
  ElementRef,
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { ThemeService } from '../../shared/services/theme.service';
import { BrandService } from '../../shared/services/brand.service';
import { AuthService } from '../../shared/services/auth.service';
import { ChatClientService } from '../../shared/services/chat-client.service';
import { ChatSocketService } from '../../shared/services/chat-socket.service';
import { CartService } from '../../shared/services/cart.service';

import { Theme } from '../../models/theme.model';
import { Brand } from '../../models/brand.model';
import { Category } from '../../models/category.model';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  // --------- Platform & DI ---------
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private themeService = inject(ThemeService);
  private brandService = inject(BrandService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private elRef = inject(ElementRef<HTMLElement>);

  // Public để template dùng trực tiếp
  public auth = inject(AuthService);
  private chatApi = inject(ChatClientService);
  private socket = inject(ChatSocketService);
  private cartService = inject(CartService);

  // --------- UI state ---------
  searchTerm = new FormControl<string>('');
  cartCount = 0;
  dropdownOpen = false;
  mobileOpen = false;

  showChat = false;
  unreadTotal = 0;
  sessionId?: number;

  hiddenOnScroll = false;
  private lastScrollY = 0;

  // --------- Dữ liệu Brands (nếu cần ở nơi khác) ---------
  brands: Brand[] = [];
  brandCols: Brand[][] = [];
  loadingBrands = true;

  // --------- Dữ liệu Chủ đề & Danh mục (nav) ---------
  /** Backend trả về /api/themes: mỗi Theme có mảng categories PHẲNG */
  themeTree: Theme[] = [];
  loadingTree = true;

  // --------- Subscriptions ---------
  private sub = new Subscription();
  private authSub?: Subscription;
  private cartSub?: Subscription;

  // Chat channel handle
  private chatChannel: any;

  // ================= Lifecycle =================
  ngOnInit(): void {
    if (!this.isBrowser) return;

    // --- Cart badge & đồng bộ khi login ---
    if (this.isLoggedIn()) {
      this.cartService.mergeLocalToServer().subscribe({
        complete: () => this.cartService.refreshCount(),
      });
    } else {
      this.cartService.refreshCount();
    }
    this.cartSub = this.cartService.count$.subscribe((v) => {
      this.cartCount = v || 0;
      this.cdr.markForCheck();
    });

    // --- Livechat theo trạng thái đăng nhập ---
    this.authSub = this.auth.isLoggedIn$().subscribe((isOk) => {
      const prev = this.showChat;
      this.showChat = !!isOk;

      if (this.showChat) {
        const token = this.getToken();
        this.socket.init(() => ({ Authorization: token }));

        this.chatApi.openWithAdmin().subscribe({
          next: (s) => {
            this.sessionId = s.id;
            this.unreadTotal = (s as any).unreadForViewer ?? 0;
            this.bindChatChannel(s.id);
            this.cdr.markForCheck();
          },
          error: () => {},
        });
      } else {
        this.sessionId = undefined;
               this.unreadTotal = 0;
        this.unbindChatChannel();
      }

      if (prev !== this.showChat) this.cdr.markForCheck();
    });

    // --- LẤY CHỦ ĐỀ + DANH MỤC (PHẲNG) để hiển thị trực tiếp trên NAV ---
    this.sub.add(
      this.themeService.getAll().subscribe({
        next: (list) => {
          this.themeTree = list || [];
          this.loadingTree = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.themeTree = [];
          this.loadingTree = false;
          this.cdr.markForCheck();
        },
      })
    );

    // --- Brands (nếu vẫn dùng ở khu vực khác, vd brand mega menu) ---
    this.sub.add(
      this.brandService.getAll().subscribe({
        next: (data) => {
          this.brands = data || [];
          this.brandCols = this.toGrid(this.brands, 3);
          this.loadingBrands = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.brands = [];
          this.brandCols = [];
          this.loadingBrands = false;
          this.cdr.markForCheck();
        },
      })
    );

    // --- Cross-tab storage sync ---
    window.addEventListener('storage', this.onStorage);

    // --- Scroll baseline ---
    this.lastScrollY = window.scrollY;
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.authSub?.unsubscribe();
    this.cartSub?.unsubscribe();
    this.unbindChatChannel();
    this.sub.unsubscribe();
    window.removeEventListener('storage', this.onStorage);
  }

  // ================= Helpers =================
  private toGrid<T>(items: T[], cols: number): T[][] {
    const out: T[][] = Array.from({ length: cols }, () => []);
    items.forEach((it, i) => out[i % cols].push(it));
    return out;
  }

  /** Chia mảng thành N cột đều nhau (dùng cho danh mục trong panel) */
  splitInto<T>(arr: T[] | undefined, cols = 2): T[][] {
    const items = arr || [];
    const out: T[][] = Array.from({ length: cols }, () => []);
    items.forEach((it, i) => out[i % cols].push(it));
    return out;
  }

  trackTheme = (_: number, th: Theme) => th.id;
  trackCategory = (_: number, c: Category) => c.id;

  // ================= Scroll handler =================
  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.isBrowser) return;
    const currentY = window.scrollY;
    // đi xuống & đã quá 100px thì ẩn
    if (currentY > this.lastScrollY && currentY > 100) {
      this.hiddenOnScroll = true;
    } else {
      this.hiddenOnScroll = false;
    }
    this.lastScrollY = currentY;
    this.cdr.markForCheck();
  }

  // ================= Outside click (đóng dropdown tài khoản) =================
  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.isBrowser) return;
    const target = ev.target as HTMLElement;
    if (!target.closest('[data-account-wrapper]')) {
      if (this.dropdownOpen) {
        this.dropdownOpen = false;
        this.cdr.markForCheck();
      }
    }
  }

  // ================= UI handlers =================
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this.cdr.markForCheck();
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
    this.cdr.markForCheck();
  }

  closeAll() {
    this.dropdownOpen = false;
    this.mobileOpen = false;
    this.cdr.markForCheck();
  }

  removeReadonly(event: FocusEvent) {
    if (!this.isBrowser) return;
    (event.target as HTMLInputElement).removeAttribute('readonly');
  }

  // ================= Search =================
  onSearch() {
    const q = (this.searchTerm.value || '').trim();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }

  // ================= Auth / Account =================
  onLogout() {
    if (!this.isBrowser) return;
    this.auth.logout?.();
    this.unreadTotal = 0;
    this.router.navigate(['/']);
  }

  private isLoggedIn(): boolean {
    try {
      if (typeof (this.auth as any).isLoggedIn === 'function') {
        return !!(this.auth as any).isLoggedIn();
      }
    } catch {}
    return !!this.getToken();
  }

  private rawToken(): string {
    try {
      return (
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('jwt') ||
        ''
      );
    } catch {
      return '';
    }
  }

  private getToken(): string {
    const raw = this.rawToken();
    return /^Bearer\s/i.test(raw) ? raw : raw ? `Bearer ${raw}` : '';
  }

  // ================= Chat helpers =================
  openChat() {
    if (!this.isBrowser) return;
    this.unreadTotal = 0;
    this.cdr.markForCheck();
    this.router.navigate(['/chat']);
  }

  private bindChatChannel(id: number) {
    try {
      this.unbindChatChannel();
      const ch = this.socket.sub(`private-chat.${id}`);
      ch.bind('message:new', () => {
        if (this.router.url !== '/chat') {
          this.unreadTotal++;
          this.cdr.markForCheck();
        }
      });
      this.chatChannel = ch;
    } catch {}
  }

  private unbindChatChannel() {
    try {
      if (this.chatChannel?.unbind) {
        this.chatChannel.unbind('message:new');
      }
      if (this.chatChannel?.unsubscribe) {
        this.chatChannel.unsubscribe();
      }
    } catch {}
    this.chatChannel = undefined;
  }

  // ================= Cross-tab sync =================
  private onStorage = (e: StorageEvent) => {
    if (e.key === 'token' || e.key === 'access_token' || e.key === 'jwt') {
      const now = this.isLoggedIn();
      if (now) {
        this.cartService.mergeLocalToServer().subscribe({
          complete: () => this.cartService.refreshCount(),
        });
      }
      if (now !== this.showChat) {
        this.showChat = now;
        this.cdr.markForCheck();
      }
    }
    if (e.key === 'guest_cart_v1') {
      this.cartService.refreshCount();
    }
  };

  // ================== Điều hướng theo CHỦ ĐỀ / DANH MỤC ==================
  /** Click danh mục -> điều hướng /products?category=<id> */
  goCategory(cat: Category) {
    if (!cat?.id) return;
    this.router.navigate(['/products'], { queryParams: { category: cat.id } });
    this.closeAll();
  }

  /** (Tuỳ chọn) Click tên chủ đề -> nếu có lọc theo theme */
  goTheme(theme: Theme) {
    if (!theme?.id) return;
    this.router.navigate(['/products'], { queryParams: { theme: theme.id } });
    this.closeAll();
  }
}
