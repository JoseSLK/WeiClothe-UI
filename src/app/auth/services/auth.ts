import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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
        tap(response => {
          localStorage.setItem('token', response.token || response.access_token);
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
