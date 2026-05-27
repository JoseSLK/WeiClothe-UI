import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout } from 'rxjs';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Bring URLs from environment
  private goApiUrl = environment.apiUrl;

  // Inject HttpClient to make requests
  constructor(private http: HttpClient) { }

  // Login through Go backend
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.goApiUrl}wei/users/login`, { email, password })
      .pipe(
        timeout(10000),
        tap(response => {
          localStorage.setItem('token', response.token || response.access_token);
        })
      );
  }

  // Register through Go backend
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.goApiUrl}wei/users/register`, userData);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Decode JWT and return `sub` claim (= user id from Keycloak) */
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const decoded = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decoded);
      return payload.sub || payload.user_id || payload.id || null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Health check — GET /wei/users/ping → 202 { message: "pong" } */
  pingUsers(): Observable<any> {
    return this.http.get(`${this.goApiUrl}wei/users/ping`);
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
