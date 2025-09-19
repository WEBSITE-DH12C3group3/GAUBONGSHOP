import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ChatApiService } from '../../shared/services/chat-api.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-chat-badge',
  standalone: true,
  template: `
    <a routerLink="/admin/live-chat" class="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-50 border">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
              d="M7 8h10M7 12h6m-9 7l3-3h8a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10z"/>
      </svg>
      <span *ngIf="count()>0" class="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] rounded-full px-1.5">
        {{ count() }}
      </span>
    </a>
  `
})
export class AdminChatBadgeComponent implements OnInit, OnDestroy {
  count = signal(0);
  private sub?: Subscription;

  constructor(private api: ChatApiService) {}

  ngOnInit(): void {
    this.refresh();
    this.sub = interval(15000).subscribe(() => this.refresh());
  }

  async refresh() {
    const list = await this.api.adminSessions('open', 0, 50).toPromise();
    const c = (list?.content || []).reduce((sum, s) => sum + (s.unreadForViewer || 0), 0);
    this.count.set(c);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
