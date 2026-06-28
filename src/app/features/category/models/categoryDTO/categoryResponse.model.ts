export interface CategoryResponse {
  id: number;
  name: string;
  subcategories?: Array<{
    id: number;
    name: string;
  }>;
}