import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../sharedService/shared.service';
import { UserResponse } from '../../model/dto/userDTO/userResponse.model';
import { UserUpdateRequest } from '../../model/dto/userDTO/userUpdateRequest.model';


@Injectable({ providedIn: 'root' })
export class UserService {
  private userUrl = '';

  constructor(private shared: SharedService, private http: HttpClient) {
    this.userUrl = this.shared.publicUrl + '/users';
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.userUrl);
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.userUrl}/${id}`);
  }

  updateUser(id: number, payload: UserUpdateRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.userUrl}/${id}`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.userUrl}/${id}`);
  }

  searchUsers(query: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(
      `${this.userUrl}/search?q=${query}`
    );
  }

}
