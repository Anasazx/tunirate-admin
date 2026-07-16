import {CompanyMemberResponse} from '../companyMemberDTO/CompanyMemberResponse.model';
import {ProductResponse} from '../../../products/models/productDTO/productResponse.model';
import {CompanyStatus} from '../../enums/companyStatus.enum.model';
import {UserResponse} from '../../../users/models/userDTO/userResponse.model';
import {CompanySocialLinkResponse} from '../companySocialLinkDTO/companySocialLinkResponse.model';
import {Industry} from '../../../../core/model/enums/industry.enum.model';
import {Country} from '../../../../core/model/enums/country.enum.model';

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
  products: ProductResponse[] | null;

}
