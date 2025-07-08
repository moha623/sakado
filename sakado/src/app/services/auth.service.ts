// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
} )
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient ) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials ).pipe(
      map((response: any) => {
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
