import { ProductImageResponse } from "./productImageResponse.model";
import { ProductStatus } from '../../enums/productStatus.enum.model';

// GET /product/op/{id}/details
export interface DetailedProductResponse {
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
  averageRating: number;
  reviewsCount: number;
  images: ProductImageResponse[];
  createdByName: string | null;
  createdById: number | null;
  updatedByName: string | null;
  updatedById: number | null;
  status: ProductStatus;
}
