import { CompanyRole } from "../../enums/companyRole.enum.model";
import { CompanyResponse } from "../companyDTO/companyResponse.model";
import { UserResponse } from "../userDTO/userResponse.model";

export interface CompanyMemberResponse {
  user: UserResponse;
  company: CompanyResponse;
  companyRole: CompanyRole;
  joinedAt: string;
}
