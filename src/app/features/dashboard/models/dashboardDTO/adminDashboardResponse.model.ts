import { ProductResponse } from '../../../products/models/productDTO/productResponse.model';

export interface AdminDashboardResponse {
  totalUsers: number;
  totalCompanies: number;
  totalActiveCompanies: number;
  totalProducts: number;
  totalReviews: number;
  totalPendingApprovals: number;
  totalPendingCompanies: number;
  totalPendingSuggestions: number;
  productsByStatus: Record<string, number>;
  companiesByStatus: Record<string, number>;
  usersOverTime: TimeSeriesPoint[];
  companiesOverTime: TimeSeriesPoint[];
  reviewsOverTime: TimeSeriesPoint[];
  recentReviews: RecentReview[];
  pendingProducts: ProductResponse[];
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface RecentReview {
  id: number;
  rating: number;
  content: string | null;
  userName: string;
  productName: string;
  productId: number;
  createdAt: string;
}
