import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { Page } from '../../../../core/model/page.model';
import { AdminUserResponse, UserResponse } from '../../models/userDTO/userResponse.model';
import { UserUpdateRequest } from '../../models/userDTO/userUpdateRequest.model';

export interface UserFilters {
  q?: string;
  role?: 'USER' | 'ADMIN' | null;
  status?: 'ACTIVE' | 'SUSPENDED' | null;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private userUrl = '';

  constructor(private shared: SharedService, private http: HttpClient) {
    this.userUrl = this.shared.publicUrl + '/users';
  }

  // Paginated admin users table, with each user's company
  getUsersAsAdmin(filters: UserFilters = {}): Observable<Page<AdminUserResponse>> {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20)
      .set('sort', 'createdAt,desc');
    if (filters.q) params = params.set('q', filters.q);
    if (filters.role) params = params.set('role', filters.role);
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<Page<AdminUserResponse>>(`${this.userUrl}/op`, { params });
  }

  updateUser(id: number, payload: UserUpdateRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.userUrl}/${id}`, payload);
  }

  // Suspended users are rejected by the backend on every request
  updateStatus(id: number, status: 'ACTIVE' | 'SUSPENDED'): Observable<AdminUserResponse> {
    return this.http.patch<AdminUserResponse>(`${this.userUrl}/${id}/status`, { status });
  }

  searchUsers(query: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.userUrl}/search`, { params: { q: query } });
  }

}
