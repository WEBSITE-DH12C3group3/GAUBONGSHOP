import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../shared/services/chat.service';
import { Conversation, ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-live-chat-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-chat-admin.html',
  styleUrls: ['./live-chat-admin.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveChatAdminComponent implements OnInit, OnDestroy {
  q = '';
  loadingList = false;
  conversations: Conversation[] = [];
  selected?: Conversation;
  messages: ChatMessage[] = [];
  sending = false;
  draft = '';

  constructor(private chat: ChatService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadList();
    // Realtime: new conversation
    this.chat.onAdminRealtime((c) => {
      this.conversations = [c, ...this.conversations];
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.chat.offAdminRealtime();
    if (this.selected?.id) this.chat.offConversationRealtime(this.selected.id);
  }

  loadList() {
    this.loadingList = true; this.cdr.markForCheck();
    this.chat.listConversations(this.q, 0, 50).subscribe({
      next: (list) => { this.conversations = list; },
      complete: () => { this.loadingList = false; this.cdr.markForCheck(); }
    });
  }

  pick(c: Conversation) {
    if (this.selected?.id) this.chat.offConversationRealtime(this.selected.id);

    this.selected = c; this.messages = []; this.draft = '';
    this.cdr.markForCheck();

    this.chat.loadMessages(c.id, 0, 40).subscribe({
      next: (list) => {
        this.messages = list.map(m => ({...m, isMine: m.senderType === 'ADMIN'}));
        this.chat.adminMarkRead(c.id).subscribe();
        this.scrollToBottomSoon();
        this.cdr.markForCheck();
      }
    });

    this.chat.onConversationRealtime(c.id, (m) => {
      m.isMine = (m.senderType === 'ADMIN');
      this.messages = [...this.messages, m];
      if (m.senderType !== 'ADMIN') {
        // tăng badge unread cho item nếu không đang focus (tuỳ chọn)
      }
      this.scrollToBottomSoon();
      this.cdr.markForCheck();
    });
  }

  send() {
    if (!this.selected || !this.draft.trim()) return;
    const text = this.draft.trim();
    this.sending = true; this.draft = ''; this.cdr.markForCheck();

    this.chat.adminSend(this.selected.id, text).subscribe({
      next: (m) => {
        m.isMine = true;
        this.messages = [...this.messages, m];
        this.scrollToBottomSoon();
        this.cdr.markForCheck();
      },
      complete: () => { this.sending = false; this.cdr.markForCheck(); }
    });
  }

  private scrollToBottomSoon() {
    setTimeout(() => {
      const box = document.getElementById('admin-chat-scroll');
      if (box) box.scrollTop = box.scrollHeight;
    }, 0);
  }
}
