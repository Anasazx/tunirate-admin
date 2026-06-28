import { ProductStatus } from "../../enums/productStatus.enum.model";

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  category: string;
  categoryName?: string;
  subcategory?: string;
  subcategoryName?: string;
  companyId: number;
  companyName: string;
  companyIsVerified?: boolean;
  companyLogoUrl?: string;
  imageUrl: string;
  createdAt: string;
  createdByName?: string;
  createdById?: number;
  updatedByName?: string;
  updatedById?: number;
  status: ProductStatus;
}
