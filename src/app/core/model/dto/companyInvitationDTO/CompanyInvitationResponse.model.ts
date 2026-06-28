export interface CompanyInvitationResponse {
  id: number;
  companyId: number;
  companyName?: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  invitedById?: number;
  invitedByName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string;
  expired: boolean;
}