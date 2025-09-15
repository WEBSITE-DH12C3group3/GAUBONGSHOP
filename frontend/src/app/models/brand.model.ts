export interface Brand {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;

  // optional để tương thích nếu backend/các phần khác trả snake_case
  logo_url?: string;
  website_url?: string;
  created_at?: string;
}

export interface BrandResponse {
  items: Brand[];
  totalPages: number;
  size: number;
  page: number;

  // optional: backend có thêm totalElements
  total?: number;
}
