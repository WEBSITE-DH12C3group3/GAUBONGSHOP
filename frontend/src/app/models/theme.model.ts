import { Category } from './category.model';

export interface ThemeReq {
  name: string;
  slug?: string | null;
  description?: string | null;
  categoryIds: number[];
}

export interface Theme {
  id: number;
  name: string;
  slug: string;
  description?: string;
  categories?: Category[];     // BE trả PHẲNG
  categoryCount?: number;      // BE có field này trong ThemeRes
}
