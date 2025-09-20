import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, interval } from 'rxjs';

import { HasPermissionDirective } from '../directives/has-permission.directive';

// ✅ Service livechat phía admin (đã cung cấp trước đó)
import { LivechatAdminService } from '../../shared/services/livechat-admin.service';
import { environment } from '../../../environments/environment';

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

  private unreadSub?: Subscription;
  private pollSub?: Subscription;

  // Handler để removeEventListener khi destroy
  private refreshHandler = () => this.forceReload();

  constructor(
    private chat: LivechatAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.chat.initSocket(() => ({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}` // ✅
    }));
    this.chat.reload();

    this.unreadSub = this.chat.unreadTotal$.subscribe(n => {
      this.unreadTotal = n; this.cdr.markForCheck();
    });

    const ms = typeof (environment as any).chatPollMs === 'number' ? (environment as any).chatPollMs : 15000;
    this.pollSub = interval(ms).subscribe(() => this.chat.reload());

    window.addEventListener('chat:refresh-unread', this.refreshHandler as EventListener);
  }

  ngOnDestroy(): void {
    this.unreadSub?.unsubscribe();
    this.pollSub?.unsubscribe();
    if (this.isBrowser) {
      window.removeEventListener(
        'chat:refresh-unread',
        this.refreshHandler as EventListener
      );
    }
  }

  /** Ép reload danh sách phiên để cập nhật badge ngay lập tức */
  private forceReload(): void {
    if (!this.isBrowser) return;
    this.chat.reload();
  }
}
