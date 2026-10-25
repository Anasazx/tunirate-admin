import { CompanyRole } from "../../enums/companyRole.enum.model";

export interface CompanyMemberRequest {
  userId: number;
  companyId: number;
  // optional, the backend defaults to WORKER
  companyRole?: CompanyRole;
}
