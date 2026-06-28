import {ProductStatus} from '../../enums/productStatus.enum.model';

export interface CompanyProductRequest {
  name: string;
  description: string | null;
  subcategoryId: number;
  status: ProductStatus | null;
}
