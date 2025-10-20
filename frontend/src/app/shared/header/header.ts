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
import { ProductService } from '../../shared/services/product.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // ✅ dùng cho [(ngModel)]
import { environment } from '../../../environments/environment';

import { ThemeService } from '../../shared/services/theme.service';
import { BrandService } from '../../shared/services/brand.service';
import { AuthService } from '../../shared/services/auth.service';
import { ChatClientService } from '../../shared/services/chat-client.service';
import { ChatSocketService } from '../../shared/services/chat-socket.service';
import { CartService } from '../../shared/services/cart.service';

import { Theme } from '../../models/theme.model';
import { Brand } from '../../models/brand.model';
import { Category } from '../../models/category.model';

import { Subscription, of } from 'rxjs'; // ✅ THÊM: of
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators'; // ✅ THÊM: operators

@Component({
  selector: 'app-user-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  // --------- Platform & DI ---------
  private productService = inject(ProductService);
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
  selectedCategoryId: number | null = null;
  favOnly = false;

  suggestOpen = false;
  suggestItems: { id: number; name: string; imageUrl?: string | null; previewUrl?: string }[] = [];
  suggestLimit = 8;

  // ✅ Voice search state
  isListening = false;
  private recognition?: any;

  // ✅ Danh mục phẳng cho combobox
  flatCategories: { id: number; name: string }[] = [];

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

  // === ẢNH: chuẩn hoá URL & fallback (đã thêm) ===
  private apiBase = (() => {
    const raw =
      (environment as any).apiBase ??
      (environment as any).apiUrl ??
      'http://localhost:8080';
    return String(raw).replace(/\/+$/, '').replace(/\/api$/, '');
  })();
  private fallbackImg = 'https://placehold.co/64x64?text=%20';

  imgUrl(path?: string | null): string {
    if (!path || !`${path}`.trim()) return this.fallbackImg;
    let clean = `${path}`.trim().replace(/\\/g, '/');
    if (/^(https?:)?\/\//i.test(clean)) return clean;           // absolute / protocol-relative
    if (clean.startsWith('/api/')) return this.apiBase + clean; // giữ /api nếu có
    if (!clean.startsWith('/')) clean = '/' + clean;
    return this.apiBase.replace(/\/$/, '') + clean;             // ghép host
  }

  onImgErr(ev: Event): void {
    const img = ev?.target as HTMLImageElement | null;
    if (!img) return;
    if (img.dataset['fallback'] === '1') return; // tránh loop
    img.dataset['fallback'] = '1';
    img.src = this.fallbackImg;
  }
  // === /ẢNH ===

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

          // TẠO flatCategories từ themeTree (loại trùng theo id)
          const seen = new Set<number>();
          const flat: { id: number; name: string }[] = [];
          for (const th of this.themeTree) {
            const cats = (th as any)?.categories as Category[] | undefined;
            if (!cats?.length) continue;
            for (const c of cats) {
              if (c?.id != null && !seen.has(c.id)) {
                seen.add(c.id);
                flat.push({ id: c.id, name: c.name as any });
              }
            }
          }
          this.flatCategories = flat.sort((a, b) =>
            (a.name || '').localeCompare(b.name || '', 'vi')
          );

          this.cdr.markForCheck();
        },
        error: () => {
          this.themeTree = [];
          this.flatCategories = []; // rỗng khi lỗi
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

    // ✅ GỢI Ý: lắng nghe ô tìm & xây list gợi ý (có ảnh)
    this.sub.add(
      (this.searchTerm.valueChanges ?? of(''))
        .pipe(
          debounceTime(150),
          map(v => (v || '').trim()),
          distinctUntilChanged(),
          switchMap(q => {
            if (!q) return of([]);
            // Nếu backend có /suggest, thay bằng: return this.productService.suggest(q)
            return this.productService.getAllProducts().pipe(
              map((res: any) => {
                const items = (res?.items || []) as any[];
                return items
                  .filter(p => this.textMatches(p?.name || '', q))
                  .slice(0, this.suggestLimit)
                  .map(p => ({
                    id: p.id,
                    name: p.name,
                    imageUrl: p.imageUrl,
                    previewUrl: this.imgUrl(p.imageUrl),
                  }));
              })
            );
          })
        )
        .subscribe(list => {
          this.suggestItems = list || [];
          this.suggestOpen = this.suggestItems.length > 0;
          this.cdr.markForCheck();
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

  // ✅ Chuẩn hoá và so khớp nhẹ cho gợi ý (bỏ dấu + prefix theo token)
  private norm(s: string): string {
    return (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }
  private textMatches(haystack: string, needle: string): boolean {
    const h = this.norm(haystack);
    const tokens = this.norm(needle).split(' ').filter(t => t.length >= 2);
    if (!tokens.length) return true;
    return tokens.every(t => h.includes(t) || h.split(' ').some(w => w.startsWith(t)));
  }

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
    this.suggestOpen = false; // ✅ đóng panel gợi ý
    this.cdr.markForCheck();
  }

  removeReadonly(event: FocusEvent) {
    if (!this.isBrowser) return;
    (event.target as HTMLInputElement).removeAttribute('readonly');
  }

  // ================= Search =================
  // ✅ điều hướng về /products với q/category/favorites
  onSearch() {
    const q = (this.searchTerm.value || '').trim();
    const params: any = {};
    if (q) params.q = q;
    if (this.selectedCategoryId != null) params.category = this.selectedCategoryId;
    if (this.favOnly) params.favorites = 1;

    this.router.navigate(['/products'], { queryParams: params });
    this.suggestOpen = false; // ✅ đóng khi tìm
  }

  // ✅ chọn một gợi ý
  selectSuggestion(name: string) {
    this.searchTerm.setValue(name);
    this.suggestOpen = false;
    this.onSearch();
  }

  // ================= Voice Search (Web Speech API) =================
  private ensureRecognition() {
    if (!this.isBrowser) return;
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;

    if (!this.recognition) {
      this.recognition = new Ctor();
      this.recognition.lang = 'vi-VN';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (e: any) => {
        try {
          const text = String(e.results[0][0].transcript || '').trim();
          this.searchTerm.setValue(text);
          this.cdr.markForCheck();
          this.onSearch();
        } catch {}
      };
      this.recognition.onend = () => {
        this.isListening = false;
        this.cdr.markForCheck();
      };
      this.recognition.onerror = () => {
        this.isListening = false;
        this.cdr.markForCheck();
      };
    }
  }

  toggleVoice() {
    if (!this.isBrowser) return;
    this.ensureRecognition();
    if (!this.recognition) return; // trình duyệt không hỗ trợ
    if (this.isListening) {
      try { this.recognition.stop(); } catch {}
      this.isListening = false;
    } else {
      try { this.recognition.start(); this.isListening = true; } catch {}
    }
    this.cdr.markForCheck();
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
