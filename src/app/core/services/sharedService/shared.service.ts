import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  publicUrl = environment.apiUrl;
  uploadPublicUrl = environment.uploadsUrl;

  getImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return 'https://placehold.co/600x400/EEE/31343C';
    }
    return `${this.uploadPublicUrl}/${imageUrl}`;
  }


}
