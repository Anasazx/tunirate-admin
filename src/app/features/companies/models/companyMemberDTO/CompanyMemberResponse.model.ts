import { CompanyRole } from "../../enums/companyRole.enum.model";
import { UserResponse } from "../../../users/models/userDTO/userResponse.model";

export interface CompanyMemberResponse {
  user: UserResponse;
  companyId: number;
  companyName: string;
  companyRole: CompanyRole;
  joinedAt: string;
}
