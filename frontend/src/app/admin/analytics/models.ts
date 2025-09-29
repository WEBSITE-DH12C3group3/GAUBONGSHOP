export type GroupBy = 'DAY'|'WEEK'|'MONTH';

export interface StatsFilter {
  start?: string;  // 'YYYY-MM-DD'
  end?: string;
  groupBy?: GroupBy;
  tzOffsetMinutes?: number;
  limit?: number;
  compareStart?: string;
  compareEnd?: string;
}

export interface SummaryDto {
  orders: number; paidOrders: number; customers: number; items: number;
  grossSales: number; shippingFee: number; couponDiscount: number; shipDiscount: number;
  netRevenue: number; cogs: number; grossProfit: number; aov: number; arpu: number;
  cancelledOrders: number;
}

export interface TimeSeriesPoint {
  period: string; orders: number; customers: number; items: number;
  grossSales: number; shippingFee: number; couponDiscount: number; shipDiscount: number;
  netRevenue: number; cogs: number; grossProfit: number; marginPct: number;
}

export interface KeyValue { key: string; count: number; amount: number; }

export interface TopProductDto { productId: number; productName: string; quantity: number; sales: number; }
