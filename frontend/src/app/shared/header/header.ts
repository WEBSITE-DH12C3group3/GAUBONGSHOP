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
  ElementRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { AuthService } from '../../shared/services/auth.service';
import { ChatClientService } from '../../shared/services/chat-client.service';
import { ChatSocketService } from '../../shared/services/chat-socket.service';
import { CartService } from '../../shared/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // ---------------- UI state ----------------
  searchTerm = new FormControl<string>('');
  cartCount = 0;
  dropdownOpen = false;
  mobileOpen = false; // hỗ trợ mobile drawer của giao diện mới

  // Chat badge & session
  showChat = false;
  unreadTotal = 0;
  sessionId?: number;

  // Scroll hide/show
  hiddenOnScroll = false;
  private lastScrollY = 0;

  // Subscriptions
  private authSub?: Subscription;
  private cartSub?: Subscription;

  // Chat channel handle (tuỳ lib, ở đây coi như any)
  private chatChannel: any;

  constructor(
    public auth: AuthService,
    private router: Router,
    private chatApi: ChatClientService,
    private socket: ChatSocketService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private elRef: ElementRef<HTMLElement>
  ) {}

  // -------------- Lifecycle --------------
  ngOnInit(): void {
    if (!this.isBrowser) return;

    // Cart badge & đồng bộ khi đã đăng nhập
    if (this.isLoggedIn()) {
      this.cartService.mergeLocalToServer().subscribe({
        complete: () => this.cartService.refreshCount()
      });
    } else {
      this.cartService.refreshCount();
    }
    this.cartSub = this.cartService.count$.subscribe((v) => {
      this.cartCount = v || 0;
      this.cdr.markForCheck();
    });

    // Livechat theo trạng thái đăng nhập
    this.authSub = this.auth.isLoggedIn$().subscribe((isOk) => {
      const prev = this.showChat;
      this.showChat = !!isOk;

      if (this.showChat) {
        // Khởi tạo socket với token
        const token = this.getToken();
        this.socket.init(() => ({ Authorization: token }));

        this.chatApi.openWithAdmin().subscribe({
          next: (s) => {
            this.sessionId = s.id;
            this.unreadTotal = (s as any).unreadForViewer ?? 0;
            this.bindChatChannel(s.id);
            this.cdr.markForCheck();
          },
          error: () => {}
        });
      } else {
        this.sessionId = undefined;
        this.unreadTotal = 0;
        this.unbindChatChannel();
      }

      if (prev !== this.showChat) this.cdr.markForCheck();
    });

    // Storage sync (token/cart từ tab khác)
    window.addEventListener('storage', this.onStorage);

    // Scroll baseline
    this.lastScrollY = window.scrollY;
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.authSub?.unsubscribe();
    this.cartSub?.unsubscribe();
    this.unbindChatChannel();
    window.removeEventListener('storage', this.onStorage);
  }

  // -------------- Event bindings --------------
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.isBrowser) return;
    const target = ev.target as HTMLElement;
    // Đóng dropdown nếu click ngoài vùng account wrapper
    // Sử dụng data-attr để linh hoạt với HTML mới: [data-account-wrapper]
    if (!target.closest('[data-account-wrapper]')) {
      if (this.dropdownOpen) {
        this.dropdownOpen = false;
        this.cdr.markForCheck();
      }
    }
  }

  // -------------- UI handlers --------------
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

  onLogout() {
    if (!this.isBrowser) return;
    this.auth.logout?.();
    this.unreadTotal = 0;
    this.router.navigate(['/']);
  }

  onSearch() {
    const q = (this.searchTerm.value || '').trim();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }

  openChat() {
    if (!this.isBrowser) return;
    this.unreadTotal = 0;
    this.cdr.markForCheck();
    this.router.navigate(['/chat']);
  }

  // -------------- Chat helpers --------------
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

  // -------------- Auth helpers --------------
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

  // -------------- Cross-tab sync --------------
  private onStorage = (e: StorageEvent) => {
    if (e.key === 'token' || e.key === 'access_token' || e.key === 'jwt') {
      const now = this.isLoggedIn();
      if (now) {
        this.cartService.mergeLocalToServer().subscribe({
          complete: () => this.cartService.refreshCount()
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
}
