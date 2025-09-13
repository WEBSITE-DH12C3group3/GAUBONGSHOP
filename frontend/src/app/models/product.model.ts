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
}

export interface ProductResponse {
  items: Product[];        // ✅ mảng sản phẩm nằm ở đây
  totalPages: number;
  size: number;
  page: number;
}
