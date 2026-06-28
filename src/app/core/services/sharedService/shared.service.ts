import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  publicUrl = "http://localhost:8080"

  uploadPublicUrl = "http://localhost:8080/uploads"

  constructor() { }



    //helper
    getImageUrl(imageUrl?: String | null): string {
        if (!imageUrl) {
            return 'https://placehold.co/600x400/EEE/31343C';
        }
        return `${this.uploadPublicUrl}/${imageUrl}`;
    }

  
}
