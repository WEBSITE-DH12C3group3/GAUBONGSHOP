export interface CarrierRateRule {
  id?: number;
  serviceId: number;
  minKm: number;
  maxKm?: number | null;
  baseFee: number;
  perKmFee: number;
  minFee?: number | null;
  freeKm?: number | null;
  codSurcharge?: number | null;
  areaSurcharge?: number | null;
  activeFrom?: string | null; // YYYY-MM-DD
  activeTo?: string | null;
  active: boolean;
}
