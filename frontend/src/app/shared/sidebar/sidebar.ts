import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChatService } from '../../shared/services/chat.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  /** Tổng số tin chưa đọc trên tất cả hội thoại */
  unreadTotal = 0;

  private listSub?: Subscription;
  private pollSub?: Subscription;

  constructor(private chat: ChatService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // tải lần đầu
    this.refreshUnread();

    // realtime: có hội thoại mới -> refresh badge
    this.chat.onAdminRealtime(() => this.refreshUnread());

    // phòng hờ: poll mỗi 60s để đồng bộ badge
    this.pollSub = interval(60_000).subscribe(() => this.refreshUnread());
  }

  ngOnDestroy(): void {
    this.chat.offAdminRealtime();
    this.listSub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  private refreshUnread(): void {
    this.listSub?.unsubscribe();
    this.listSub = this.chat.listConversations('', 0, 50).subscribe({
      next: (convs) => {
        this.unreadTotal = convs.reduce((s, c) => s + (c.unreadCount || 0), 0);
        this.cdr.markForCheck();
      },
      error: () => {
        // im lặng; không chặn render sidebar
      }
    });
  }
}
