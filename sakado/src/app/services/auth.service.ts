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

  private tokenKey = 'token';
  private loggedIn: BehaviorSubject<boolean>;
  loggedIn$: Observable<boolean>;

  constructor(private http: HttpClient) {
    const isLogged = this.hasToken();
    this.loggedIn = new BehaviorSubject<boolean>(isLogged);
    this.loggedIn$ = this.loggedIn.asObservable();
  }

  // login(credentials: any): Observable<any> {
  //   return this.http.post(`${this.API_URL}`, credentials).pipe(
  //     map((response: any) => {
  //       if (typeof window !== 'undefined' && response && response.accessToken) {
  //         localStorage.setItem(this.tokenKey, response.accessToken);
  //         this.loggedIn.next(true);
  //       }

  //       return response;
  //     })
  //   );
  // }
login(credentials: any): Observable<any> {
  return this.http.post(`${this.API_URL}`, credentials).pipe(
    map((response: any) => {
      console.log('Login response:', response);
      if (typeof window !== 'undefined' && response && response.accessToken) {
        localStorage.setItem(this.tokenKey, response.accessToken);
        console.log('Token stored in localStorage:', localStorage.getItem(this.tokenKey));
        this.loggedIn.next(true);
      } else {
        console.warn('No accessToken found in response');
      }
      return response;
    })
  );
}

  private hasToken(): boolean {
    return (
      typeof window !== 'undefined' && !!localStorage.getItem(this.tokenKey)
    );
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
    this.loggedIn.next(false);
  }

  getToken(): string | null {
    return typeof window !== 'undefined'
      ? localStorage.getItem(this.tokenKey)
      : null;
  }
}
