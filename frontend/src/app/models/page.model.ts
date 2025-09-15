export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // trang hiện tại (bắt đầu từ 0)
}
