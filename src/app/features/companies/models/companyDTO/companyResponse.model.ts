import { CompanyMemberResponse } from '../companyMemberDTO/CompanyMemberResponse.model';
import { CompanyStatus } from '../../enums/companyStatus.enum.model';
import { UserResponse } from '../../../users/models/userDTO/userResponse.model';
import { CompanySocialLinkResponse } from '../companySocialLinkDTO/companySocialLinkResponse.model';
import { Industry } from '../../../../core/model/enums/industry.enum.model';
import { Country } from '../../../../core/model/enums/country.enum.model';

// GET /company/op/details/{id}; products are loaded separately and paginated
export interface CompanyResponse {
  id: number;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phoneNumber: string | null;
  socialLinks: CompanySocialLinkResponse[] | null;
  address: string | null;
  country: Country;
  industry: Industry;
  status: CompanyStatus;
  verifiedBy: UserResponse | null;
  verifiedAt: string | null;
  createdBy: UserResponse | null;
  createdAt: string | null;
  members: CompanyMemberResponse[] | null;
  productCount: number;
}

// Row of the admin companies table (GET /company/op)
export interface CompanySummaryResponse {
  id: number;
  name: string;
  logoUrl: string | null;
  country: Country;
  industry: Industry;
  status: CompanyStatus;
  productCount: number;
  memberCount: number;
  createdAt: string | null;
}

// Minimal company used in pickers (GET /company)
export interface CompanyOption {
  id: number;
  name: string;
  logoUrl?: string | null;
  status: CompanyStatus;
}

export type CompanyStatusCounts = Partial<Record<CompanyStatus, number>>;
