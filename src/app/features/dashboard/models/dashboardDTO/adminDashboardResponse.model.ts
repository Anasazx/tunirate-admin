export interface AdminDashboardResponse {
  totalUsers: number;
  totalCompanies: number;
  totalActiveCompanies: number;
  totalProducts: number;
  totalReviews: number;
  totalPendingApprovals: number;
  usersOverTime: TimeSeriesPoint[];
  companiesOverTime: TimeSeriesPoint[];
  reviewsOverTime: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}
