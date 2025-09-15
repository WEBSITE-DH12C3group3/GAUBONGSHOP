export interface ProductAttribute {
  attributeId: number;
  name: string;
  value: string;
}

export interface AttributeResponse {
  items: ProductAttribute[];
  totalPages: number;
  size: number;
  page: number;
}
