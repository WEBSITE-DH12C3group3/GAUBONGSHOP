import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, interval } from 'rxjs';

import { ChatApiService } from '../services/chat-api.service';            // chỉnh path nếu khác
import { environment } from '../../../environments/environment';          // chỉnh path nếu khác

import { HasPermissionDirective } from '../directives/has-permission.directive';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HasPermissionDirective],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  /** Tổng số tin chưa đọc trên tất cả phiên chat (phía admin) */
  unreadTotal = 0;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private listSub?: Subscription;
  private pollSub?: Subscription;

  // handler để có thể removeEventListener khi destroy
  private unreadRefreshHandler = () => this.refreshUnread();

  constructor(private chat: ChatApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;                 // ⛔️ SSR: bỏ qua

    // Gọi ngay khi load
    this.refreshUnread();

    // Polling định kỳ
    const ms = Number((environment as any)?.pollingMs ?? 15000);
    this.pollSub = interval(ms).subscribe(() => this.refreshUnread());

    // Lắng nghe event để cập nhật tức thì từ nơi khác:
    // window.dispatchEvent(new CustomEvent('chat:unreadRefresh'));
    window.addEventListener(
      'chat:unreadRefresh',
      this.unreadRefreshHandler as EventListener
    );
  }

  ngOnDestroy(): void {
    this.listSub?.unsubscribe();
    this.pollSub?.unsubscribe();
    if (this.isBrowser) {
      window.removeEventListener(
        'chat:unreadRefresh',
        this.unreadRefreshHandler as EventListener
      );
    }
  }

  /** Gọi API lấy danh sách phiên open của admin và cộng dồn unread */
  private refreshUnread(): void {
    if (!this.isBrowser) return;

    this.listSub?.unsubscribe();
    this.listSub = this.chat.adminSessions('open', 0, 50).subscribe({
      next: (page: any) => {
        const sessions = page?.content ?? [];
        this.unreadTotal = sessions.reduce(
          (sum: number, s: any) => sum + (s.unreadForViewer || 0),
          0
        );
        // Tránh NG0100 khi hydrate
        queueMicrotask(() => this.cdr.markForCheck());
      },
      error: () => {
        // im lặng; không chặn render sidebar
      },
    });
  }
}
