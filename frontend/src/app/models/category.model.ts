export interface Category {
  id: number;
  name: string;
  description?: string;
  isFeatured?: boolean;
  createdAt?: string;
  slug?: string;
}

export interface CategoryResponse {
  content: Category[];
  totalPages?: number;
  totalElements?: number;
  size?: number;
  page?: number;
}
