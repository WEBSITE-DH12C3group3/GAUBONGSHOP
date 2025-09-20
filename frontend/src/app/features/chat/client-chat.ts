// src/app/features/chat/client-chat.page.ts
import { Component, OnDestroy, OnInit, ChangeDetectorRef, Inject, LOCALE_ID } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatClientService } from '../../shared/services/chat-client.service';
import { ChatSocketService } from '../../shared/services/chat-socket.service';
import { ChatSessionResponse, MessageDTO } from '../../models/chat.model';

@Component({
  standalone: true,
  selector: 'app-client-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './client-chat.html',
  styleUrls: ['./client-chat.css']
})
export class ClientChatPage implements OnInit, OnDestroy {
  meId?: number; // nếu decode JWT có thể lấy id
  session?: ChatSessionResponse;
  messages: MessageDTO[] = [];
  input = '';
  loading = true;

  private readonly TZ = 'Asia/Ho_Chi_Minh';

  constructor(
    private api: ChatClientService,
    private socket: ChatSocketService,
    private cdr: ChangeDetectorRef,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit(): void {
    this.api.openWithAdmin().subscribe(s => {
      this.session = s;
      this.cdr.detectChanges();
      this.loadMessages();

      // subscribe realtime
      const ch = this.socket.sub(`private-chat.${s.id}`);
      ch.bind('message:new', (payload: any) => {
        this.messages.push(payload.message);
        this.cdr.detectChanges();
        this.scrollBottom();
      });

      // vào trang là mark read
      this.api.markRead(s.id).subscribe();
    });
  }

  loadMessages() {
    if (!this.session) return;
    this.api.messages(this.session.id, 0, 50).subscribe(res => {
      this.messages = res.content ?? res.items ?? [];
      this.loading = false;
      this.cdr.detectChanges();
      setTimeout(() => this.scrollBottom(), 0);
    });
  }

  send() {
    if (!this.session || !this.input.trim()) return;
    const content = this.input.trim();
    this.input = '';
    this.cdr.detectChanges();

    this.api.send(this.session.id, content).subscribe(m => {
      this.messages.push(m);
      this.cdr.detectChanges();
      this.scrollBottom();
    });
  }

  private scrollBottom() {
    const el = document.getElementById('chat-scroll');
    if (el) el.scrollTop = el.scrollHeight;
  }

  ngOnDestroy(): void {
    if (this.session) this.socket.unsub(`private-chat.${this.session.id}`);
  }

  // ===== Divider ngày theo múi giờ VN (giống admin) =====
  private sameDayTZ(a: string | Date, b: string | Date): boolean {
    const fa = formatDate(a, 'yyyy-MM-dd', this.locale, this.TZ);
    const fb = formatDate(b, 'yyyy-MM-dd', this.locale, this.TZ);
    return fa === fb;
  }

  showDayDivider(i: number): boolean {
    if (i === 0) return true;
    const prev = this.messages[i - 1]?.createdAt as any;
    const curr = this.messages[i]?.createdAt as any;
    if (!prev || !curr) return false;
    return !this.sameDayTZ(prev, curr);
  }

  dayLabel(i: number): string {
    const d = this.messages[i]?.createdAt as any;
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (this.sameDayTZ(d, now)) return 'Hôm nay';
    if (this.sameDayTZ(d, yesterday)) return 'Hôm qua';
    return formatDate(d, 'dd/MM/yyyy', this.locale, this.TZ);
  }
}
