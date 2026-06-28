export interface ProductRequest {
  name: string;
  description: string | null;
  subcategoryId: string;
  companyId: number | null;
}
