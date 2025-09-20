import { Injectable } from '@angular/core';
import Pusher, { Channel } from 'pusher-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private pusher?: Pusher;
  private channels = new Map<string, Channel>();

  init(getAuthHeader: () => Record<string, string>) {
    if (this.pusher) return;
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      authEndpoint: environment.pusher.authEndpoint,
      auth: { headers: getAuthHeader() }
    });
  }

  sub(name: string): Channel {
    if (!this.pusher) throw new Error('Pusher not init');
    if (this.channels.has(name)) return this.channels.get(name)!;
    const ch = this.pusher.subscribe(name);
    this.channels.set(name, ch);
    return ch;
  }

  unsub(name: string) {
    if (!this.pusher) return;
    if (this.channels.has(name)) {
      this.pusher.unsubscribe(name);
      this.channels.delete(name);
    }
  }

  disconnect() {
    this.pusher?.disconnect();
    this.channels.clear();
    this.pusher = undefined;
  }
}
