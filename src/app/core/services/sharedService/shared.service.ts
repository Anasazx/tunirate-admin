import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {



  localDev = true;

  publicUrl!: string;
  uploadPublicUrl!: string;

  constructor() {
    if (this.localDev) {
      this.publicUrl = "http://localhost:8080";
      this.uploadPublicUrl = "http://localhost:9000/uploads";
    }
    else {
      this.publicUrl = "https://reviewhood.tech/api";
      this.uploadPublicUrl = "https://reviewhood.tech/uploads";
    }
  }

  getImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return 'https://placehold.co/600x400/EEE/31343C';
    }
    return `${this.uploadPublicUrl}/${imageUrl}`;
  }


}
