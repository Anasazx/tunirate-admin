import {SocialPlatform} from '../../enums/SocialPlatform.enum.model';

export interface CompanySocialLinkResponse {
  id: string;
  companyId: number;
  platform: SocialPlatform;
  url: string;
}
