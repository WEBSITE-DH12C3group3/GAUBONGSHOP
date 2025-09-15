export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;

  // optional snake_case để an toàn
  contact_person?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierResponse {
  items: Supplier[];
  page: number;
  size: number;
  totalPages: number;
  total?: number; // map từ totalElements nếu cần
}
