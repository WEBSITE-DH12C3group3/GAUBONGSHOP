export interface PageResponse<T> { content: T[]; number: number; size: number; totalElements: number; totalPages: number; }

export interface ChatSessionDTO {
  id: number;
  participant1Id: number;
  participant2Id: number;
  status: 'open'|'closed'|'pending';
  createdAt?: string | null;
  updatedAt?: string | null;
  unreadForViewer: number;
  lastMessageSnippet?: string | null;
}

export interface MessageDTO {
  id: number;
  sessionId: number;
  senderId: number;
  content: string;
  read: boolean;
  createdAt?: string | null;
}
