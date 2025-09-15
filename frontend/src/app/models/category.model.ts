export interface Category {
  id: number;
  name: string;
  description: string;
  isFeatured: boolean;
  createdAt: string;
}
export interface CategoryResponse {
  items: Category[];
  totalPages: number;
  size: number;
  page: number;
}