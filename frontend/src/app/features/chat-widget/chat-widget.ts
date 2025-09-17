import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../shared/services/chat.service';
import { ChatMessage, Conversation } from '../../models/chat.model';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  open = false;
  loading = false;
  sending = false;

  conversation?: Conversation;
  messages: ChatMessage[] = [];
  draft = '';

  constructor(private chat: ChatService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.conversation?.id) {
      this.chat.offConversationRealtime(this.conversation.id);
    }
  }

  toggle() {
    this.open = !this.open;
    this.cdr.markForCheck();

    if (this.open && !this.conversation) {
      this.initConversation();
    }
  }

  private initConversation() {
    this.loading = true; this.cdr.markForCheck();
    this.chat.getOrCreateMyConversation().subscribe({
      next: (c) => {
        this.conversation = c;
        this.loadLatest();
        this.chat.onConversationRealtime(c.id, (m) => {
          m.isMine = (m.senderType === 'USER'); // FE mark (tương đối)
          this.messages = [...this.messages, m];
          this.scrollToBottomSoon();
          this.cdr.markForCheck();
        });
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); },
      complete: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  private loadLatest() {
    if (!this.conversation) return;
    this.chat.loadMessages(this.conversation.id, 0, 30).subscribe({
      next: (list) => {
        const uid = this.conversation?.userId;
        this.messages = list.map(m => ({ ...m, isMine: m.senderType === 'USER' }));
        this.scrollToBottomSoon();
        this.chat.markRead(this.conversation!.id).subscribe();
      }
    });
  }

  send() {
    if (!this.draft.trim() || !this.conversation) return;
    const text = this.draft.trim();
    this.sending = true; this.draft = ''; this.cdr.markForCheck();

    this.chat.sendMessage(this.conversation.id, text).subscribe({
      next: (m) => {
        m.isMine = true;
        this.messages = [...this.messages, m];
        this.scrollToBottomSoon();
        this.cdr.markForCheck();
      },
      error: () => { /* có thể show toast */ },
      complete: () => { this.sending = false; this.cdr.markForCheck(); }
    });
  }

  private scrollToBottomSoon() {
    setTimeout(() => {
      const box = document.getElementById('chatbox-scroll');
      if (box) box.scrollTop = box.scrollHeight;
    }, 0);
  }
}
