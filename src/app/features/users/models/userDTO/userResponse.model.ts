// GET /users/search (used by the member picker)
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  emailVerified?: boolean;
  avatarUrl?: string | null;
  globalRole: 'USER' | 'ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

// Row of the admin users table (GET /users/op)
export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  globalRole: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  provider: 'LOCAL' | 'GOOGLE';
  companyId: number | null;
  companyName: string | null;
  companyRole: 'HEAD' | 'WORKER' | null;
  createdAt: string;
}
