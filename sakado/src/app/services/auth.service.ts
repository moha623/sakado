// private readonly API_URL = 'https://dummyjson.com/auth/';

// private tokenKey = 'token';
// private loggedIn: BehaviorSubject<boolean>;
// loggedIn$: Observable<boolean>;

// constructor(private http: HttpClient) {
//   const isLogged = this.hasToken();
//   this.loggedIn = new BehaviorSubject<boolean>(isLogged);
//   this.loggedIn$ = this.loggedIn.asObservable();
// }

// register(
//   username: string,
//   email: string,
//   password: string,
//   lastname: string,
//   number: number,
//   confirmpassword: string
// ): Observable<any> {
//   return this.http.post(this.API_URL + 'signup', {
//     username,
//     lastname,
//     email,
//     password,
//     number,
//     confirmpassword,
//   });
// }
// login(credentials: any): Observable<any> {
//   return this.http.post(`${this.API_URL + 'login'}`, credentials).pipe(
//     map((response: any) => {
//       console.log('Login response:', response);
//       if (typeof window !== 'undefined' && response && response.accessToken) {
//         localStorage.setItem(this.tokenKey, response.accessToken);
//         console.log(
//           'Token stored in localStorage:',
//           localStorage.getItem(this.tokenKey)
//         );
//         this.loggedIn.next(true);
//       } else {
//         console.warn('No accessToken found in response');
//       }
//       return response;
//     })
//   );
// }

// private hasToken(): boolean {
//   return (
//     typeof window !== 'undefined' && !!localStorage.getItem(this.tokenKey)
//   );
// }

// logout() {
//   if (typeof window !== 'undefined') {
//     localStorage.removeItem(this.tokenKey);
//   }
//   this.loggedIn.next(false);
// }

// getToken(): string | null {
//   return typeof window !== 'undefined'
//     ? localStorage.getItem(this.tokenKey)
//     : null;
// }
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  idToken,
  User,
} from '@angular/fire/auth';
import { BehaviorSubject, catchError, from, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  currentToken$ = this.tokenSubject.asObservable();
  private loggedIn: BehaviorSubject<boolean>;
  loggedIn$: Observable<boolean>;

  constructor(private auth: Auth) {
    this.initTokenTracking();
    // Initialize login state based on token presence
    this.loggedIn = new BehaviorSubject<boolean>(this.tokenSubject.value !== null);
    this.loggedIn$ = this.loggedIn.asObservable();
  }

  private initTokenTracking(): void {
    idToken(this.auth).subscribe((token) => {
      this.tokenSubject.next(token);
      this.loggedIn.next(!!token); // Update login state
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken'); // Ensure token removal
      }
    });
  }

// auth.service.ts
register(email: string, password: string): Observable<UserCredential> {
  return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
    switchMap(userCredential => 
      this.logout().pipe(
        map(() => userCredential),
        catchError(error => {
          console.error('Logout after registration failed', error);
          return of(userCredential);
        })
      )
    )
  );
}

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        // Clear token from all locations
        this.tokenSubject.next(null);
        this.loggedIn.next(false);
        localStorage.removeItem('authToken');
      })
    );
  }

  get currentToken(): string | null {
    return this.tokenSubject.value;
  }
}
