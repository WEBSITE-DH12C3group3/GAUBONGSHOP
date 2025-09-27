import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  Inject,
  LOCALE_ID,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, formatDate, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LivechatAdminService } from '../../shared/services/livechat-admin.service';
import { ChatSessionResponse, MessageDTO } from '../../models/chat.model';

@Component({
  standalone: true,
  selector: 'app-admin-livechat',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-livechat.html',
  styleUrls: ['./admin-livechat.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLivechatPage implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  sessions: ChatSessionResponse[] = [];
  selected?: ChatSessionResponse;
  messages: MessageDTO[] = [];
  input = '';
  loading = false;

  @ViewChild('scrollHost', { static: false })
  private scrollHost?: ElementRef<HTMLDivElement>;

  private readonly TZ = 'Asia/Ho_Chi_Minh';

  constructor(
    private readonly svc: LivechatAdminService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(LOCALE_ID) private readonly locale: string
  ) {}

  ngOnInit(): void {
    // 1) Khởi tạo socket admin + Authorization (chỉ ở browser)
    if (isPlatformBrowser(this.platformId)) {
      this.svc.initSocket((): Record<string, string> => {
        const raw =
          localStorage.getItem('token') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('jwt') ||
          '';
        const Authorization = raw ? (/^Bearer\s/i.test(raw) ? raw : `Bearer ${raw}`) : '';
        // LUÔN trả object (kể cả rỗng) để không lỗi TS
        return Authorization ? { Authorization } : {};
      });
    }

    // 2) Theo dõi danh sách phiên
    this.svc.sessions$.subscribe((list) => {
      this.sessions = list || [];
      if (this.selected) {
        this.selected = this.sessions.find((x) => x.id === this.selected!.id);
      }
      this.cdr.markForCheck();
    });

    // 3) Tải lần đầu
    this.svc.reload();
  }

  select(s: ChatSessionResponse) {
    if (!s) return;
    this.selected = s;
    this.loading = true;
    this.cdr.markForCheck();

    this.svc.setActive(s.id);

    this.svc.messages(s.id).subscribe({
      next: (items) => {
        this.messages = items || [];
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.scrollBottom(), 0);
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  send() {
    if (!this.selected) return;
    const text = (this.input || '').trim();
    if (!text) return;

    this.input = '';
    this.cdr.markForCheck();

    this.svc.send(this.selected.id, text).subscribe({
      next: (m) => {
        this.messages.push(m);
        this.cdr.markForCheck();
        this.scrollBottom();
      },
      error: (e) => console.error('[admin-livechat] send failed:', e),
    });
  }

  trackSession = (_: number, s: ChatSessionResponse) => s.id;
  trackMessage = (_: number, m: MessageDTO) => m.id;

  rowClass(m: MessageDTO, sel: ChatSessionResponse) {
    return m.senderId === sel.participant1Id ? 'flex justify-start' : 'flex justify-end';
  }
  bubbleClass(m: MessageDTO, sel: ChatSessionResponse) {
    return m.senderId === sel.participant1Id
      ? 'bg-white rounded-bl-sm'
      : 'bg-pink-600 text-white rounded-br-sm';
  }

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

  private scrollBottom() {
    const el = this.scrollHost?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  ngOnDestroy(): void {
    try {
      (this.svc as any)?.dispose?.();
    } catch {}
  }
}
