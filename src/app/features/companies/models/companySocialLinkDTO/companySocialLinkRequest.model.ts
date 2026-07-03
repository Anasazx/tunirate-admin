import {SocialPlatform} from '../../enums/SocialPlatform.enum.model';

export interface CompanySocialLinkRequest {
  platform: SocialPlatform,
  url: string;
}
