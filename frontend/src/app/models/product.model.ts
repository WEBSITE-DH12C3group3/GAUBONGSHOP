// src/app/models/product.model.ts

/** Thuộc tính của sản phẩm (đúng theo BE: attributeId, attributeName, value) */
export interface ProductAttribute {
  attributeId: number;
  attributeName: string;   // ✅ BE trả "attributeName"
  value: string;
}

/** Thông tin sản phẩm (đúng theo BE) */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  createdAt: string;

  // Các trường BE map thêm khi trả ra (có thể vắng)
  brandName?: string;
  categoryName?: string;
  avgRating?: number;
  totalReviews?: number;

  // Thuộc tính hiển thị (đồng bộ với BE)
  attributes?: ProductAttribute[];

  // Các field mở rộng cho FE (nếu BE có/hoặc bạn tính toán)
  discountPercent?: number;  // % giảm giá (có thể undefined)
  promotions?: string[];     // danh sách text khuyến mãi (có thể undefined)
}

/** Kết quả trả về dạng phân trang từ /api/products (BE trả: items + page info) */
export interface ProductResponse {
  items: Product[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

/** Kết quả trả về dạng danh sách đơn (ví dụ /api/products/latest, /{id}/related) */
export interface ProductListResponse {
  items: Product[];
}

/** Nếu sau này muốn gộp chi tiết + liên quan trong 1 call thì dùng interface này */
export interface ProductDetailResponse {
  product: Product;
  related: Product[];
}
