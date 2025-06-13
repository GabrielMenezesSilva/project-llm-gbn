import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser =
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  constructor(private http: HttpClient) {
    // Recupera o usuário do localStorage ao iniciar
    if (this.isBrowser) {
      const user = localStorage.getItem('user');
      if (user) {
        this.currentUserSubject.next(JSON.parse(user));
      }
    }
  }

  register(
    email: string,
    password: string,
    name: string,
    confirmPassword: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, {
        email,
        password,
        confirmPassword,
        name,
      })
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, {
        email,
        password,
      })
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  logout(): Observable<void> {
    let refreshToken = null;
    if (this.isBrowser) {
      refreshToken = localStorage.getItem('refreshToken');
    }
    return this.http
      .post<void>(`${environment.apiUrl}/api/auth/logout`, {
        refreshToken,
      })
      .pipe(tap(() => this.clearAuthData()));
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    let refreshToken = null;
    if (this.isBrowser) {
      refreshToken = localStorage.getItem('refreshToken');
    }
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${environment.apiUrl}/api/auth/refresh`,
        { refreshToken }
      )
      .pipe(
        tap((tokens) => {
          if (this.isBrowser) {
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
          }
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/auth/me`);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (this.isBrowser) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    this.currentUserSubject.next(response.user);
  }

  private clearAuthData(): void {
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }
}
