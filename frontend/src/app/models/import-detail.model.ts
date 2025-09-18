import { Product } from './product.model';

export interface ImportDetailModel {
  id: number;
  importId: number;
  productId: number;
  product?: Partial<Product>;   // ✅ cho phép chỉ cần {id}
  quantity: number;
  unitPrice: number;
}
