export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  reviewDate: string;
}

export interface ReviewResponse {
  items: Review[];
  totalPages: number;
  size: number;
  page: number;
}
