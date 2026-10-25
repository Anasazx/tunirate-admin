import { ProductStatus } from "../../enums/productStatus.enum.model";
import { ProductImageResponse } from './productImageResponse.model';

// Row of the admin products table (GET /product/op)
export interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  subcategoryId: number | null;
  subcategoryName: string | null;
  companyId: number;
  companyName: string;
  companyIsVerified: boolean;
  companyLogoUrl: string | null;
  image: ProductImageResponse | null;
  createdAt: string;
  createdByName: string | null;
  createdById: number | null;
  updatedByName: string | null;
  updatedById: number | null;
  status: ProductStatus;
}
