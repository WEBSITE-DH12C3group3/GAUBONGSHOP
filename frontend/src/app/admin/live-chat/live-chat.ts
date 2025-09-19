import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  computed,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatApiService } from '../../shared/services/chat-api.service';
import { ChatRealtimeService } from '../../shared/services/chat-realtime.service';
import { ChatSessionDTO, MessageDTO } from '../../models/chat.model';

@Component({
  selector: 'app-admin-live-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './live-chat.html',
})
export class LiveChatPage implements OnDestroy {
  // ===== state =====
  sessions = signal<ChatSessionDTO[]>([]);
  selected = signal<ChatSessionDTO | null>(null);
  messages = signal<MessageDTO[]>([]);

  loadingSessions = signal<boolean>(true);
  loadingMessages = signal<boolean>(false);

  // soạn tin
  reply = '';

  // tìm kiếm
  q = signal<string>('');
  filtered = computed(() => {
    const term = this.q().trim().toLowerCase();
    const list = this.sessions();
    if (!term) return list;
    return list.filter((s) => {
      const name = `user #${s.participant1Id}`.toLowerCase();
      const snip = (s.lastMessageSnippet || '').toLowerCase();
      return name.includes(term) || snip.includes(term);
    });
  });

  constructor(
    private api: ChatApiService,
    private rt: ChatRealtimeService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadSessions();
  }

  ngOnDestroy() {
    this.rt.teardown();
  }

  // ===== data =====
  async loadSessions() {
    this.loadingSessions.set(true);
    try {
      const page = await this.api.adminSessions('open', 0, 50).toPromise();
      this.sessions.set(page?.content || []);
      // chọn cuộc đầu tiên nếu chưa chọn
      if (!this.selected() && this.sessions().length) {
        this.select(this.sessions()[0]);
      }
    } finally {
      this.loadingSessions.set(false);
      this.cdr.detectChanges();
    }
  }

  async select(s: ChatSessionDTO | null) {
    this.selected.set(s);
    this.messages.set([]);
    this.rt.teardown();

    if (!s) return;

    // nạp lịch sử
    this.loadingMessages.set(true);
    try {
      const page = await this.api.adminMessages(s.id, 0, 200).toPromise();
      this.messages.set(page?.content || []);
      this.scrollToBottom();

      // mark read ngay khi mở phiên
      this.api.adminMarkRead(s.id).subscribe(() => {
        window.dispatchEvent(new CustomEvent('chat:unreadRefresh'));
        // đưa badge về 0 cho phiên đang mở
        this.patchSessionUnread(s.id, 0);
      });

      // realtime cho phiên
      this.rt.connectToSession(s.id, {
        onMessage: (m) => {
          if (m.sessionId !== s.id) return;
          this.messages.update((arr) => [...arr, m]);
          this.scrollToBottom();

          // tin nhắn do khách gửi -> mark read tức thì
          if (m.senderId === s.participant1Id) {
            this.api.adminMarkRead(s.id).subscribe(() => {
              window.dispatchEvent(new CustomEvent('chat:unreadRefresh'));
              this.patchSessionUnread(s.id, 0);
            });
          }

          this.cdr.detectChanges();
        },
        onClosed: () => {
          // bạn có thể hiển thị toast “phiên đã đóng”
          // hoặc disable input ở template dựa trên selected()?.status
        },
      });
    } finally {
      this.loadingMessages.set(false);
      this.cdr.detectChanges();
    }
  }

  async send() {
    const s = this.selected();
    const text = this.reply.trim();
    if (!s || !text) return;

    this.reply = '';

    // optimistic UI
    const optimistic: MessageDTO = {
      id: Date.now(),
      sessionId: s.id,
      senderId: 0, // admin
      content: text,
      read: true,
      createdAt: new Date().toISOString(),
    };
    this.messages.update((arr) => [...arr, optimistic]);
    this.scrollToBottom();
    this.cdr.detectChanges();

    try {
      const saved = await this.api.adminReply(s.id, text).toPromise();
      if (saved) {
        this.messages.update((arr) =>
          arr.map((m) => (m === optimistic ? saved : m))
        );
      }
      window.dispatchEvent(new CustomEvent('chat:unreadRefresh'));
      // cập nhật snippet ở list
      this.patchSessionSnippet(s.id, text);
    } catch {
      // TODO: hiện toast lỗi nếu cần
    } finally {
      this.cdr.detectChanges();
    }
  }

  closeSession() {
    const s = this.selected();
    if (!s) return;
    this.api.adminClose(s.id).subscribe({
      next: () => {
        // xóa khỏi danh sách hoặc reload
        this.sessions.update((list) => list.filter((x) => x.id !== s.id));
        this.selected.set(null);
        window.dispatchEvent(new CustomEvent('chat:unreadRefresh'));
        this.cdr.detectChanges();
      },
    });
  }

  // ===== helpers =====
  trackByMessageId(_i: number, m: MessageDTO) {
    return m.id;
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.getElementById('admin-chat-scroll');
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }

  private patchSessionUnread(sessionId: number, unread: number) {
    this.sessions.update((list) =>
      list.map((s) => (s.id === sessionId ? { ...s, unreadForViewer: unread } : s))
    );
  }

  private patchSessionSnippet(sessionId: number, snippet: string) {
    const text =
      snippet.length > 60 ? `${snippet.slice(0, 60)}…` : snippet;
    this.sessions.update((list) =>
      list.map((s) =>
        s.id === sessionId ? { ...s, lastMessageSnippet: text } : s
      )
    );
  }
}
