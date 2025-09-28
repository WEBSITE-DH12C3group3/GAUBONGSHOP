export interface ShippingService {
  id?: number;
  carrierId: number;
  code: string;
   name: string;
  label: string;
  active: boolean;
  baseDaysMin?: number;
  baseDaysMax?: number;
  createdAt?: string;
  updatedAt?: string;
}
