import {
  Component,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

import { ChatApiService } from '../../shared/services/chat-api.service';
import { ChatRealtimeService } from '../../shared/services/chat-realtime.service';
import { NotifyService } from '../../shared/services/notify.service';
import { ChatWidgetComponent } from './chat-widget';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, ChatWidgetComponent],
  templateUrl: './chat-bubble.html',
})
export class ChatBubbleComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  open = false;
  unread = 0;
  sessionId?: number;

  constructor(
    private api: ChatApiService,
    private rt: ChatRealtimeService,
    private notify: NotifyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Chỉ bootstrap khi ở browser
    if (this.isBrowser) this.bootstrap();
  }

  ngOnDestroy() {
    this.rt.teardown();
  }

  async toggle() {
    this.open = !this.open;
    if (this.open && this.isBrowser) {
      await this.ensureSession();
    } else {
      this.rt.teardown();
    }
  }

  // ===== private =====
  private async bootstrap() {
    await this.ensureSession();
    await this.bootstrapUnread();
  }

  private get storage(): Storage | null {
    return this.isBrowser ? window.localStorage : null;
  }

  private async ensureSession() {
    if (!this.isBrowser) return;
    if (this.sessionId) return;

    const cached = Number(this.storage?.getItem('chat_session_id') || '0');
    if (cached) {
      this.sessionId = cached;
      return;
    }

    const s = await this.api.openWithAdmin().toPromise();
    this.sessionId = s?.id;
    if (this.sessionId) this.storage?.setItem('chat_session_id', String(this.sessionId));
  }

  private async bootstrapUnread() {
    if (!this.isBrowser) return;
    try {
      const noti = await this.api.clientUnreadNotifications().toPromise();
      this.unread = noti?.length || 0;
      // tránh NG0100 khi SSR/hydration
      queueMicrotask(() => this.cdr.detectChanges());
    } catch {}
  }

  // callback từ widget
  onWidgetOpened() {
    this.unread = 0;

    if (!this.isBrowser || !this.sessionId) return;

    this.rt.connectToSession(this.sessionId, (msg) => {
      if (!this.open) {
        this.unread++;
        this.notify.notify('Shop trả lời', msg?.content || 'Bạn có tin nhắn mới');
        this.cdr.detectChanges();
      }
    });
  }
}
