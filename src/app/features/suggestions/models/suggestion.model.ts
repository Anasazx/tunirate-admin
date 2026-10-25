export type SuggestionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SuggestionResponse {
  id: number;
  name: string;
  companyName: string | null;
  description: string | null;
  status: SuggestionStatus;
  createdAt: string;
  productId: number | null;
  productName: string | null;
  userName: string | null;
}
