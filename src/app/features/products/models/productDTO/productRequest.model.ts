import {ProductStatus} from '../../enums/productStatus.enum.model';

export interface ProductRequest {
  name: string;
  description: string | null;
  subcategoryId: string;
  companyId: number | null;
  status: ProductStatus | null;
}
