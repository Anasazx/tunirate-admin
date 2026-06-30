import {SocialPlatform} from '../enums/SocialPlatform.enum.model';

export interface CompanySocialLink {
  id: string;
  platform: SocialPlatform;
  url: String;
}
