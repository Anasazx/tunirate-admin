export interface AuthResponse {
  token: string;
  email: string;
  username: string;
  role: string;
  companyId?: number;
  companyRole?: "HEAD" | "WORKER";
}
