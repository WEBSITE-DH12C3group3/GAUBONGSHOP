

// src/app/features/chat/client-chat.page.ts  (đường dẫn bạn đang dùng)
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatClientService } from '../../shared/services/chat-client.service';
import { ChatSocketService } from '../../shared/services/chat-socket.service';
import { ChatSessionResponse, MessageDTO } from '../../models/chat.model';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-client-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './client-chat.html',
  styleUrls: ['./client-chat.css']
})
export class ClientChatPage implements OnInit, OnDestroy {
  meId?: number; // nếu bạn decode token có thể lấy ra, còn không cứ render "senderId === meId"
  session?: ChatSessionResponse;
  messages: MessageDTO[] = [];
  input = '';
  loading = true;

  constructor(
    private api: ChatClientService,
    private socket: ChatSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.api.openWithAdmin().subscribe(s => {
      this.session = s;
      this.cdr.detectChanges(); // ✅ cập nhật ngay khi có session
      this.loadMessages();

      // subscribe realtime
      const ch = this.socket.sub(`private-chat.${s.id}`);
      ch.bind('message:new', (payload: any) => {
        this.messages.push(payload.message);
        this.cdr.detectChanges(); // ✅ re-render khi có tin mới
        this.scrollBottom();
      });

      // vào trang là mark read
      this.api.markRead(s.id).subscribe(() => {
        // nếu bạn muốn chắc chắn badge ngoài header cũng về 0 tức thì:
        // window.dispatchEvent(new CustomEvent('chat:refresh-unread'));
      });
    });
  }

  loadMessages() {
    if (!this.session) return;
    this.api.messages(this.session.id, 0, 50).subscribe(res => {
      this.messages = res.content ?? res.items ?? [];
      this.loading = false;
      this.cdr.detectChanges(); // ✅ sau khi load xong
      setTimeout(() => this.scrollBottom(), 0);
    });
  }

  send() {
    if (!this.session || !this.input.trim()) return;
    const content = this.input.trim();
    this.input = '';
    this.cdr.detectChanges(); // ✅ cập nhật input ngay

    this.api.send(this.session.id, content).subscribe(m => {
      // push optimistic
      this.messages.push(m);
      this.cdr.detectChanges(); // ✅ re-render sau khi push
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
}
