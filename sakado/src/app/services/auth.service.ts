
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
import { Auth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut, 
         UserCredential,
         idToken } from '@angular/fire/auth';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private tokenSubject = new BehaviorSubject<string | null>(null);
  currentToken$ = this.tokenSubject.asObservable();

  constructor(private auth: Auth) {
    this.initTokenTracking();
  }

  private initTokenTracking(): void {
    // Get token on auth state changes
    idToken(this.auth).subscribe(token => {
      this.tokenSubject.next(token);
      if (token) localStorage.setItem('authToken', token);
    });
  }

  register(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(() => this.fetchToken())
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(() => this.fetchToken())
    );
  }

  private fetchToken(): void {
    this.auth.currentUser?.getIdToken().then(token => {
      this.tokenSubject.next(token);
    });
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.tokenSubject.next(null);
        localStorage.removeItem('authToken');
      })
    );
  }

  get currentToken(): string | null {
    return this.tokenSubject.value;
  }

    refreshToken(): Observable<string> {
    return from(this.auth.currentUser!.getIdToken(true)).pipe(
      tap(token => this.tokenSubject.next(token))
    );
  }

  autoRefreshToken(): void {
    // Refresh token every 30 minutes
    setInterval(() => {
      if (this.auth.currentUser) this.refreshToken().subscribe();
    }, 30 * 60 * 1000);
  }
}
 
  
 
