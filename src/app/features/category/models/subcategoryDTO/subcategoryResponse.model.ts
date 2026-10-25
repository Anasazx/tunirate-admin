export interface SubcategoryResponse {
  id: number;
  name: string;
  categoryId: number;
  categoryName?: string;
  // only on GET /subcategories/op
  productCount?: number;
}
