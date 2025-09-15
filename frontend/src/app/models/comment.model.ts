// src/app/models/comment.model.ts
export interface Comment {
  id: number;
  productId: number;
  userId: number | null;
  userName: string;        // luôn string
  rating: number;          // 1–5
  comment: string;
  createdAt: string;       // dùng đúng field bạn render trong template
}
