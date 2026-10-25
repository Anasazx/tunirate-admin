import { ProductStatus } from '../../enums/productStatus.enum.model';

export interface ProductFilters {
  q?: string;
  status?: ProductStatus | null;
  companyId?: number | null;
  subcategoryId?: number | null;
  uncategorized?: boolean;
  page?: number;
  size?: number;
}

export type ProductStatusCounts = Partial<Record<ProductStatus, number>>;
