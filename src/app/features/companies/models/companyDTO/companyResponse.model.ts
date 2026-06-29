import {CompanyMemberResponse} from '../companyMemberDTO/CompanyMemberResponse.model';
import {ProductResponse} from '../../../products/models/productDTO/productResponse.model';

export interface CompanyResponse {
  id: number;
  name: string;
  description?: string | null;
  logoUrl?: string;
  bannerUrl?: string;
  verified?: boolean | null;
  members?: CompanyMemberResponse[] | null;
  products?: ProductResponse[] | null;
}
