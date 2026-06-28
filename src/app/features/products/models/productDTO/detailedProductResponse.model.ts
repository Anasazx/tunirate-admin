import { ProductImageResponse } from "./productImageResponse.model";
import { ReviewResponse } from "../../../../core/model/dto/reviewDTO/reviewResponse.model";
import {ProductStatus} from '../../enums/productStatus.enum.model';

export interface DetailedProductResponse {
  id: number;
  name: string;
  description: string;
  category: string | null;
  subcategory: string | null;
  companyId: number;
  companyName: string;
  companyIsVerified: boolean;
  companyLogoUrl: string;
  averageRating: number | null;
  reviewsCount: number;
  reviews: ReviewResponse[];
  images: ProductImageResponse[];
  createdByName: string;
  createdById: number;
  updatedByName: string | null;
  updatedById: number | null;
  status: ProductStatus;
}


