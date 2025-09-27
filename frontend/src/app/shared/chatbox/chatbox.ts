import { ChatService, ChatMsg } from '../services/chatbox.service';
import { Component } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.html',
  styleUrls: ['./chatbox.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
})
export class ChatboxComponent {
  open = false;
  input = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  sending = false;
  msgs: ChatMsg[] = [
    { role: 'bot', text: 'Xin chào! Mình có thể giúp gì? (ví dụ: “phí ship”, “đổi hàng”, “khuyến mãi”...)' }
  ];

  constructor(private chat: ChatService) {}

  toggle() { this.open = !this.open; }

  async send() {
    if (this.input.invalid || this.sending) return;
    const text = this.input.value.trim();
    if (!text) return;

    this.msgs.push({ role: 'user', text });
    this.sending = true;
    this.input.setValue('');

    this.chat.send(text).subscribe({
      next: (res) => {
        this.msgs.push({ role: 'bot', text: res.answer, meta: { source: res.source, confidence: res.confidence } });
        this.sending = false;
        setTimeout(() => this.scrollBottom(), 0);
      },
      error: () => {
        this.msgs.push({ role: 'bot', text: 'Xin lỗi, hệ thống đang bận. Bạn thử lại giúp mình nhé!' });
        this.sending = false;
      }
    });
  }

  scrollBottom() {
    const el = document.querySelector('#chatbox-body');
    if (el) el.scrollTop = el.scrollHeight;
  }
}
