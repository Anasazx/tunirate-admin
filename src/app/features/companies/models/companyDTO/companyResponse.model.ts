import {CompanyMemberResponse} from '../companyMemberDTO/CompanyMemberResponse.model';

export interface CompanyResponse {
  id: number;
  name: string;
  description?: string | null;
  logoUrl?: string;
  bannerUrl?: string;
  verified?: boolean | null;
  members?: CompanyMemberResponse[] | null;
}
