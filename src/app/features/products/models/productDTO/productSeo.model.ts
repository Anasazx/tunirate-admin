export interface FaqItem {
  question: string;
  answer: string;
}

// SEO content of a product: pros and cons are one item per line
export interface ProductSeo {
  id: number;
  name: string;
  reviewCount: number;
  // Whether Google may index the public page: enough reviews, or featured
  indexable: boolean;
  featured: boolean;
  seoDescription: string | null;
  pros: string | null;
  cons: string | null;
  faq: FaqItem[];
  priceTnd: number | null;
  whereToBuy: string | null;
}

// Replaces every SEO field: null or blank clears it
export type ProductSeoRequest = Omit<ProductSeo, 'id' | 'name' | 'reviewCount' | 'indexable'>;
