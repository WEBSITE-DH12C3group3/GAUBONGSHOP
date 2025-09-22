export interface ShippingService {
  id?: number;
  carrierId: number;
  code: string;
  label: string;
  active: boolean;
  baseDaysMin?: number;
  baseDaysMax?: number;
}
