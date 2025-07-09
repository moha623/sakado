// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
 

export class AuthService {
  private readonly API_URL = 'https://dummyjson.com/auth/login';

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  // Expose login status as Observable
  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  private hasToken(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('jwt_token');
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}`, credentials).pipe(
      map((response: any) => {
        if (typeof window !== 'undefined' && response && response.token) {

          localStorage.setItem('jwt_token', response.token);
          this.loggedIn.next(true);  // notify login success
        }
        return response;
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      this.loggedIn.next(false);  // notify logout
    }
  }

  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  }

  // Optional synchronous check
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

