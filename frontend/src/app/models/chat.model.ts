export type SenderType = 'USER' | 'ADMIN' | 'SYSTEM';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderType: SenderType;
  text: string;
  sentAt: string;         // ISO string
  isMine?: boolean;       // FE helper
}

export interface Conversation {
  id: number;
  userId?: number;
  userName?: string;
  lastMessage?: string;
  lastTime?: string;      // ISO
  unreadCount?: number;
  assignedTo?: string;    // agent name/email (optional)
  status?: 'OPEN' | 'RESOLVED';
}
