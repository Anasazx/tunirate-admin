import { ProductImageResponse } from "./dto/productDTO/productImageResponse.model";
import { ReviewResponse } from "./dto/reviewDTO/reviewResponse.model";

export interface DetailedProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  companyId?: number;
  companyName: string;
  companyIsVerified: boolean;
  companyLogoUrl: string;
  averageRating: number | null;
  reviewsCount: number;
  reviews: ReviewResponse[];
  images: ProductImageResponse[];
}


