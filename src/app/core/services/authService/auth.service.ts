import { Injectable } from '@angular/core';
import { SharedService } from '../sharedService/shared.service';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../../model/dto/authDTO/authResponse.model';
import { LoginRequest } from '../../model/dto/authDTO/loginRequest.model';
import { RegisterRequest } from '../../model/dto/authDTO/registerRequest.model';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authUrl : String = "";
  private tokenKey = 'auth_user';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.loadFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.authUrl = this.sharedService.publicUrl + "/auth";
  }

  // Request/response DTOs
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl.toString()}/login`, request).pipe(
      tap((res) => {
        this.saveToStorage(res);
        this.currentUserSubject.next(res);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    console.log(request);

    return this.http.post<AuthResponse>(`${this.authUrl.toString()}/register`, request).pipe(
      tap((res) => {
        this.saveToStorage(res);
        this.currentUserSubject.next(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  getCompanyId(): number | null {
    return this.currentUserSubject.value?.companyId ?? null;
  }

  getCompanyRole(): "HEAD" | "WORKER" | null {
    return this.currentUserSubject.value?.companyRole ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value?.token;
  }

  isAdmin(): boolean {
    const role = this.currentUserSubject.value?.role;
    return !!role && role.toLowerCase() === 'admin';
  }

  isCompanyMember(): boolean {
    return !!this.currentUserSubject.value?.companyId;
  }

  private saveToStorage(res: AuthResponse) {
    try {
      localStorage.setItem(this.tokenKey, JSON.stringify(res));
    } catch (e) {
      console.error('Failed to persist auth token', e);
    }
  }

  private loadFromStorage(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(this.tokenKey);
      return raw ? JSON.parse(raw) as AuthResponse : null;
    } catch (e) {
      console.error('Failed to read auth token from storage', e);
      return null;
    }
  }

}


