export interface CartItem {
  productId: number;
  productName: string;
  imageUrl?: string;
  availableStock: number;
  quantity: number;
  unitPrice: number;    // số
  lineTotal: number;    // số
}

export interface CartSummary {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}
