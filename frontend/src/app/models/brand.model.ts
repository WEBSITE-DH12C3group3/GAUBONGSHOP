export interface Brand {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface BrandResponse {
  items: Brand[];
  totalPages: number;
  size: number;
  page: number;
}
