export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    emailVerified: boolean;
    avatarUrl: string | null;
  };
  role: 'USER' | 'ADMIN';
  companyId?: number | null;
  companyRole?: 'HEAD' | 'WORKER' | null;
}
