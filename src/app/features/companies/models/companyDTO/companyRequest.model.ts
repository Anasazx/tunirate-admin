import {CompanyStatus} from '../../enums/companyStatus.enum.model';
import {Country} from '../../../../core/model/enums/country.enum.model';
import {Industry} from '../../../../core/model/enums/industry.enum.model';
import {CompanySocialLinkRequest} from '../companySocialLinkDTO/companySocialLinkRequest.model';

export interface CompanyRequest {
  name: string;
  description?: string | null;
  phoneNumber: string | null;
  address : string | null;
  country : Country;
  industry : Industry;
  socialLinks: CompanySocialLinkRequest[],
  status : CompanyStatus | null;
}
