import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { ChatApiService } from '../../shared/services/chat-api.service';
import { ChatRealtimeService } from '../../shared/services/chat-realtime.service';
import { MessageDTO } from '../../models/chat.model';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CdkDrag],
  templateUrl: './chat-widget.html'
})
export class ChatWidgetComponent implements OnInit {
  @Input() sessionId?: number;
  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  loading = true;
  messages: MessageDTO[] = [];
  input = '';
  meId = 0;

  constructor(
    private api: ChatApiService,
    private rt: ChatRealtimeService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.meId = this.api.meId();
    this.opened.emit();
    await this.load();

    if (this.sessionId) {
      // realtime
      this.rt.connectToSession(this.sessionId, {
        onMessage: (m) => {
          if (m.sessionId === this.sessionId) {
            this.messages = [...this.messages, m];
            this.cdr.detectChanges();
            this.scrollToBottom();
            // đang mở => mark read
            this.api.markRead(this.sessionId!).subscribe();
          }
        }
      });
      // mark read sau khi mở
      this.api.markRead(this.sessionId).subscribe();
    }
  }

  async load() {
    if (!this.sessionId) return;
    this.loading = true;
    const page = await this.api.myMessages(this.sessionId, 0, 100).toPromise();
    this.messages = page?.content ?? [];
    this.loading = false;
    this.cdr.detectChanges();
    setTimeout(() => this.scrollToBottom(), 0);
  }

  async send() {
    if (!this.sessionId || !this.input.trim()) return;
    const text = this.input.trim();
    this.input = '';

    const optimistic: MessageDTO = {
      id: Math.floor(Math.random() * 1e9),
      sessionId: this.sessionId,
      senderId: this.meId,
      content: text,
      read: true,
      createdAt: new Date().toISOString()
    };
    this.messages = [...this.messages, optimistic];
    this.cdr.detectChanges();
    this.scrollToBottom();

    try {
      const msg = await this.api.sendClient(this.sessionId, text).toPromise();
      if (msg) this.messages = this.messages.map(m => m === optimistic ? msg : m);
      this.cdr.detectChanges();
      this.scrollToBottom();
    } catch {}
  }

  trackById(_i: number, m: MessageDTO) { return m.id; }

  private scrollToBottom() {
    const el = document.getElementById('chat-scroll');
    if (el) el.scrollTop = el.scrollHeight;
  }
}
