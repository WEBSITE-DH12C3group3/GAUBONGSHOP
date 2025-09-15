// src/app/models/product.model.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  brandId: number;
  stock: number;
  createdAt: string;

    // optional (join thêm từ backend)
  brand?: string;
  category?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductResponse {
  items: Product[];        // mảng sản phẩm
  totalPages: number;
  size: number;
  page: number;
}

export interface ProductDetailResponse {
  product: Product;        // chi tiết sản phẩm
  related: Product[];      // sản phẩm liên quan
}
