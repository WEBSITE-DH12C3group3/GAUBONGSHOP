import {
  Component, OnDestroy, OnInit, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, ElementRef, inject, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatClientService } from '../../shared/services/chat-client.service';
import { ChatSocketService } from '../../shared/services/chat-socket.service';
import { ChatSessionResponse, MessageDTO } from '../../models/chat.model';

@Component({
  standalone: true,
  selector: 'app-client-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './client-chat.html',
  styleUrls: ['./client-chat.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientChatPage implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  session?: ChatSessionResponse;
  messages: MessageDTO[] = [];
  input = '';
  loading = true;

  private unbindSocket?: () => void;

  @ViewChild('chatScroll', { static: false }) chatScrollRef?: ElementRef<HTMLDivElement>;

  constructor(
    private readonly api: ChatClientService,
    private readonly socket: ChatSocketService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ❗ Nếu đang SSR, KHÔNG gọi API cần token
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false; // cho phép render khung trang
      return;
    }

    // (A) Khởi tạo Pusher với Authorization từ localStorage
    this.socket.init(() => {
      const raw =
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('jwt') || '';
      const Authorization = raw ? (/^Bearer\s/i.test(raw) ? raw : `Bearer ${raw}`) : '';
      return Authorization ? { Authorization } : undefined;
    });

    // (B) Mở/tạo session với admin – chỉ chạy ở browser để interceptor đọc được localStorage
    this.api.openWithAdmin().subscribe({
      next: (s) => {
        this.session = s;
        this.cdr.markForCheck();

        // Load tin nhắn
        this.loadMessages();

        // Subscribe realtime
        const ch = this.socket.sub(`private-chat.${s.id}`);
        this.unbindSocket = this.socket.bind(ch, 'message:new', (payload: any) => {
          const msg: MessageDTO = payload?.message ?? payload;
          if (!msg) return;
          this.messages.push(msg);
          this.cdr.markForCheck();
          this.scrollBottom();
        });

        // Đánh dấu đã đọc
        this.api.markRead(s.id).subscribe({ complete: () => {} });
      },
      error: (e) => {
        this.loading = false;
        this.cdr.markForCheck();
        console.error('[client-chat] openWithAdmin failed:', e);
      }
    });
  }

  private loadMessages() {
    if (!this.session) return;
    this.loading = true;
    this.cdr.markForCheck();

    this.api.messages(this.session.id, 0, 50).subscribe({
      next: (items) => {
        this.messages = items || [];
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.scrollBottom(), 0);
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  send() {
    if (!this.session) return;
    const text = (this.input || '').trim();
    if (!text) return;

    this.input = '';
    this.cdr.markForCheck();

    this.api.send(this.session.id, text).subscribe({
      next: (m) => {
        this.messages.push(m);
        this.cdr.markForCheck();
        this.scrollBottom();
      },
      error: (e) => console.error('[client-chat] send failed:', e)
    });
  }

  private scrollBottom() {
    const el = this.chatScrollRef?.nativeElement || document.getElementById('chat-scroll');
    if (el) el.scrollTop = el.scrollHeight;
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.unbindSocket?.();
        if (this.session) this.socket.unsub(`private-chat.${this.session.id}`);
      } catch {}
    }
  }
}
