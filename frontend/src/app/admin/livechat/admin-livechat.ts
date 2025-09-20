import { CommonModule, formatDate } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  Inject,
  LOCALE_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LivechatAdminService } from '../../shared/services/livechat-admin.service';
import { ChatSessionResponse, MessageDTO } from '../../models/chat.model';

@Component({
  standalone: true,
  selector: 'app-admin-livechat',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-livechat.html',
  styleUrls: ['./admin-livechat.css'],
})
export class AdminLivechatPage implements OnInit {
  sessions: ChatSessionResponse[] = [];
  selected?: ChatSessionResponse;
  messages: MessageDTO[] = [];
  input = '';
  loading = false;

  @ViewChild('scrollHost', { static: false })
  private scrollHost?: ElementRef<HTMLDivElement>;

  // Timezone cố định cho mọi phép tính ngày/giờ
  private readonly TZ = 'Asia/Ho_Chi_Minh';

  constructor(
    private svc: LivechatAdminService,
    private cdr: ChangeDetectorRef,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit(): void {
    // Khởi tạo socket kênh admin + auth header
    this.svc.initSocket(() => ({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    }));

    // Theo dõi danh sách session
    this.svc.sessions$.subscribe((list) => {
      this.sessions = list;
      if (this.selected) {
        // giữ lại item đã chọn nếu còn trong danh sách
        this.selected = this.sessions.find((x) => x.id === this.selected!.id);
      }
      this.cdr.detectChanges();
    });

    // Tải lần đầu
    this.svc.reload();
  }

  /** Chọn 1 cuộc hội thoại */
  select(s: ChatSessionResponse) {
    this.selected = s;
    this.svc.setActive(s.id); // mark read ở backend
    this.loading = true;
    this.cdr.detectChanges();

    this.svc.messages(s.id).subscribe((res) => {
      this.messages = res.content ?? res.items ?? [];
      this.loading = false;
      this.cdr.detectChanges();
      setTimeout(() => this.scrollBottom(), 0);
    });
  }

  /** Gửi tin nhắn */
  send() {
    if (!this.selected || !this.input.trim()) return;
    const c = this.input.trim();
    this.input = '';
    this.cdr.detectChanges(); // clear input ngay

    this.svc.send(this.selected.id, c).subscribe((m) => {
      this.messages.push(m);
      this.cdr.detectChanges();
      this.scrollBottom();
    });
  }

  // ===== trackBy cho list để render mượt =====
  trackSession = (_: number, s: ChatSessionResponse) => s.id;
  trackMessage = (_: number, m: MessageDTO) => m.id;

  // ===== UI: KHÁCH (participant1) TRÁI - trắng; ADMIN PHẢI - hồng =====
  rowClass(m: MessageDTO, sel: ChatSessionResponse) {
    return m.senderId === sel.participant1Id ? 'flex justify-start' : 'flex justify-end';
  }
  bubbleClass(m: MessageDTO, sel: ChatSessionResponse) {
    return m.senderId === sel.participant1Id
      ? 'bg-white rounded-bl-sm' // khách: trái, nền trắng
      : 'bg-pink-600 text-white rounded-br-sm'; // admin: phải, nền hồng
  }

  // ===== Divider theo ngày — chuẩn timezone VN =====
  /** So sánh 2 thời điểm có cùng ngày theo TZ cố định */
  private sameDayTZ(a: string | Date, b: string | Date): boolean {
    const fa = formatDate(a, 'yyyy-MM-dd', this.locale, this.TZ);
    const fb = formatDate(b, 'yyyy-MM-dd', this.locale, this.TZ);
    return fa === fb;
  }

  /** Có hiển thị divider ở vị trí i không */
  showDayDivider(i: number): boolean {
    if (i === 0) return true;
    const prev = this.messages[i - 1]?.createdAt as any;
    const curr = this.messages[i]?.createdAt as any;
    if (!prev || !curr) return false;
    return !this.sameDayTZ(prev, curr);
  }

  /** Nhãn ngày ở vị trí i: Hôm nay/Hôm qua/dd/MM/yyyy */
  dayLabel(i: number): string {
    const d = this.messages[i]?.createdAt as any;
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (this.sameDayTZ(d, now)) return 'Hôm nay';
    if (this.sameDayTZ(d, yesterday)) return 'Hôm qua';
    return formatDate(d, 'dd/MM/yyyy', this.locale, this.TZ);
  }

  // ===== Scroll xuống cuối khung chat =====
  private scrollBottom() {
    const el = this.scrollHost?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
