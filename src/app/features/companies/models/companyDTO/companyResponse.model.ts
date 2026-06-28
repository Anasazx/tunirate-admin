export interface CompanyResponse {
  id: number;
  name: string;
  description?: string | null;
  logoUrl?: string;
  bannerUrl?: string;
  verified?: boolean | null;
}