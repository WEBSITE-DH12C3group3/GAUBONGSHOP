export interface ShippingCarrier {
  id?: number;
  code: string;        // INTERNAL, GHTK,...
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
