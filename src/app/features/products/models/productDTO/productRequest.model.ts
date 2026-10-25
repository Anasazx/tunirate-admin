import { ProductStatus } from '../../enums/productStatus.enum.model';

export interface ProductRequest {
  name: string;
  description: string | null;
  subcategoryId: number | null;
  companyId: number;
  status: ProductStatus | null;
}
