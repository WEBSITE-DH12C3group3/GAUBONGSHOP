import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PusherService } from './pusher.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatRealtimeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private channel: any;

  constructor(private pusher: PusherService) {}

  connectToSession(sessionId: number, handlers:
    | ((msg: any) => void)
    | { onMessage: (m:any)=>void; onClosed?: ()=>void }) {

    if (!this.isBrowser) return;

    const onMessage =
      typeof handlers === 'function' ? handlers : handlers.onMessage;

    this.channel = this.pusher.subscribe(`private-chat.${sessionId}`);
    if (!this.channel) return;

    this.channel.bind('message:new', (payload: any) => onMessage(payload));
    if (typeof handlers !== 'function' && handlers.onClosed) {
      this.channel.bind('session:closed', () => handlers.onClosed!());
    }
  }

  teardown() {
    try {
      this.channel?.unsubscribe?.();
    } catch {}
    this.channel = null;
  }
}
