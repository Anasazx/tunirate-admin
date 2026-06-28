export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  companyId?: number;
  companyRole?: "HEAD" | "WORKER";
}
