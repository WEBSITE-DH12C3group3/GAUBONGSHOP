import { ImportDetailModel } from './import-detail.model';

export interface ImportModel {
  id: number;                // id phiếu nhập
  importDate: string;        // ngày nhập (ISO string)
  totalCost: number;         // tổng tiền
  status: string;            // pending | completed | canceled
 supplierId?: number | null; 
  notes?: string;            // ghi chú
  createdAt?: string;        // ngày tạo (optional)
  updatedAt?: string;        // ngày cập nhật (optional)

  // Danh sách chi tiết phiếu nhập
  details: ImportDetailModel[];
}
