import { Injectable, inject } from '@angular/core';
import Pusher, { Channel } from 'pusher-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PusherService {
  private pusher?: Pusher;
  private channels = new Map<string, Channel>();

  private getToken(): string | null {
    try { return localStorage.getItem('token'); } catch { return null; }
  }

  private ensure() {
    if (this.pusher) return;
    const token = this.getToken();
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      // Nếu dùng private channel auth từ BE, bật 2 dòng này:
      // authEndpoint: environment.pusher.authEndpoint,
      // auth: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });
  }

  subscribe(channelName: string, events: Record<string, (data:any)=>void>) {
    this.ensure();
    if (!this.pusher) return;

    if (!this.channels.has(channelName)) {
      const ch = this.pusher.subscribe(channelName);
      this.channels.set(channelName, ch);
      Object.entries(events).forEach(([evt, cb]) => ch.bind(evt, cb));
    } else {
      const ch = this.channels.get(channelName)!;
      Object.entries(events).forEach(([evt, cb]) => ch.bind(evt, cb));
    }
  }

  unsubscribe(channelName: string) {
    if (!this.pusher) return;
    if (this.channels.has(channelName)) {
      const ch = this.channels.get(channelName)!;
      ch.unbind_all();
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }
}
