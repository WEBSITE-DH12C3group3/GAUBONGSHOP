// src/app/shared/header/header.ts
import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { AuthService } from '../../shared/services/auth.service';
import { ChatClientService } from '../../shared/services/chat-client.service';
import { ChatSocketService } from '../../shared/services/chat-socket.service';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-user-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // UI
  searchTerm = new FormControl<string>('');
  cartCount = 0;
  dropdownOpen = false;

  // Chat badge
  showChat = false;
  unreadTotal = 0;
  private sessionId?: number;

  // SSR guard
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    public auth: AuthService,
    private router: Router,
    private chatApi: ChatClientService,
    private socket: ChatSocketService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // ===== Merge guest cart nếu đã đăng nhập =====
    if (this.isLoggedIn()) {
      this.cartService.mergeLocalToServer().subscribe({
        complete: () => this.cartService.refreshCount()
      });
    } else {
      // guest: đồng bộ badge từ local
      this.cartService.refreshCount();
    }

    // Subscribe badge
    this.cartService.count$.subscribe(v => {
      this.cartCount = v || 0;
      this.cdr.markForCheck();
    });

    // Chat only when logged in
    this.showChat = this.isLoggedIn();
    if (this.showChat) {
      const token = this.getToken();
      this.socket.init(() => ({ Authorization: token }));

      this.chatApi.openWithAdmin().subscribe((s) => {
        this.sessionId = s.id;
        this.unreadTotal = s.unreadForViewer ?? 0;
        this.cdr.markForCheck();

        const ch = this.socket.sub(`private-chat.${s.id}`);
        ch.bind('message:new', () => {
          if (this.router.url !== '/chat') {
            this.unreadTotal++;
            this.cdr.markForCheck();
          }
        });
      });
    }

    // nghe thay đổi token ở TAB khác
    window.addEventListener('storage', this.onStorage);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    window.removeEventListener('storage', this.onStorage);
  }

  // ===== Dropdown =====
  @HostListener('document:click', ['$event'])
  onClickOutside(ev: MouseEvent) {
    if (!this.isBrowser) return;
    const target = ev.target as HTMLElement;
    if (!target.closest('.relative')) this.dropdownOpen = false;
  }
  toggleDropdown() { this.dropdownOpen = !this.dropdownOpen; }

  removeReadonly(event: FocusEvent) {
    if (!this.isBrowser) return;
    (event.target as HTMLInputElement).removeAttribute('readonly');
  }

  // ===== Auth =====
  onLogout() {
    if (!this.isBrowser) return;
    this.auth.logout?.();
    this.unreadTotal = 0;
    this.router.navigate(['/']);
  }

  // ===== Search =====
  onSearch() {
    const q = (this.searchTerm.value || '').trim();
    if (q) this.router.navigate(['/search'], { queryParams: { q } });
  }

  // ===== Chat =====
  openChat() {
    if (!this.isBrowser || !this.sessionId) return;
    this.unreadTotal = 0;
    this.cdr.markForCheck();
    this.router.navigate(['/chat']);
  }

  // ===== Helpers =====
  private isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    try {
      const anyAuth = this.auth as any;
      if (typeof anyAuth.isAuthenticated === 'function') return !!anyAuth.isAuthenticated();
      if (typeof anyAuth.isLoggedIn === 'function') return !!anyAuth.isLoggedIn();
    } catch {}
    return !!this.rawToken();
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

  private onStorage = (e: StorageEvent) => {
    if (e.key === 'token' || e.key === 'access_token' || e.key === 'jwt') {
      const now = this.isLoggedIn();
      if (now) {
        // vừa đăng nhập ở tab khác → merge
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
      // guest cart đổi → cập nhật badge
      this.cartService.refreshCount();
    }
  };
}
