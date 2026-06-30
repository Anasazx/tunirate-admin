import {CompanyStatus} from '../../enums/companyStatus.enum.model';
import {Country} from '../../../../core/model/enums/country.enum.model';
import {Industry} from '../../../../core/model/enums/industry.enum.model';

export interface CompanyRequest {
  name: string;
  description?: string | null;
  phoneNumber: string | null;
  websiteUrl : string | null;
  address : string | null;
  country : Country;
  industry : Industry;
  status : CompanyStatus | null;
}
