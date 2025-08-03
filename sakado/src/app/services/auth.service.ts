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
   User as FirebaseUser 
} from '@angular/fire/auth';
import {
  DocumentData,
  Firestore,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore'; // ADD FIRESTORE
import { query, startAfter, limit } from '@angular/fire/firestore';
import {
  BehaviorSubject,
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { User } from '../models/user.model';

import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
 
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  currentToken$ = this.tokenSubject.asObservable();
  private loggedIn: BehaviorSubject<boolean>;
  loggedIn$: Observable<boolean>;
  private totalUsersCache: number | null = null;

    private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();


  constructor(private auth: Auth, private firestore: Firestore) {
    this.initTokenTracking();
    this.loggedIn = new BehaviorSubject<boolean>(
      this.tokenSubject.value !== null
    );
    this.loggedIn$ = this.loggedIn.asObservable();
        if (this.auth.currentUser) {
      this.fetchUserProfile(this.auth.currentUser.uid);
    }
  }
  private async fetchUserProfile(uid: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const snapshot = await getDoc(userDocRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.data() as User;
      this.currentUserSubject.next({ ...userData, uid: uid });
    }
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

  register(
    email: string,
    password: string,
    userData: { username: string; lastname: string; number: any; role:string } // ADD USERDATA PARAM
  ): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap((userCredential) => {
        const uid = userCredential.user.uid;
        const userDocRef = doc(this.firestore, `users/${uid}`); // CREATE DOC REF

        // COMBINE AUTH DATA WITH FORM DATA
        const userProfile = {
          email: email,
          ...userData,
          createdAt: serverTimestamp(),
        };

        return from(setDoc(userDocRef, userProfile)).pipe(
          // SAVE TO FIRESTORE
          map(() => userCredential),
          catchError((firestoreError) => {
            // FALLBACK: DELETE USER IF FIRESTORE FAILS
            signOut(this.auth);
            return throwError(() => firestoreError);
          })
        );
      }),
      switchMap((userCredential) =>
        this.logout().pipe(
          map(() => userCredential),
          catchError((error) => {
            console.error('Logout after registration failed', error);
            return of(userCredential);
          })
        )
      )
    );
  }

  // Update login to fetch profile
  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap((userCred) => this.fetchUserProfile(userCred.user.uid))
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.tokenSubject.next(null);
        this.loggedIn.next(false);
        localStorage.removeItem('authToken');
      })
    );
  }
  hasRole(requiredRole: string): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.role === requiredRole)
    );
  }
  async getUsers(
    pageSize: number,
    lastDoc: DocumentSnapshot | null
  ): Promise<{
    users: User[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    let tripsRef = collection(this.firestore, 'users');
    let q = query(tripsRef, limit(pageSize));

    if (lastDoc) {
      q = query(tripsRef, startAfter(lastDoc), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as User),
    }));
    const nextLastDoc =
      snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { users, lastDoc: nextLastDoc };
  }
  async getTotalTrips(): Promise<number> {
    if (this.totalUsersCache === null) {
      const usersRef = collection(this.firestore, 'users');
      const snapshot = await getCountFromServer(usersRef);
      this.totalUsersCache = snapshot.data().count;
    }
    return this.totalUsersCache;
  }
  async deleteUser(uid: string): Promise<void> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    try {
      await setDoc(userDoc, {}, { merge: true }); // Clear user data
      await this.auth.currentUser?.delete(); // Delete Firebase user
      this.tokenSubject.next(null); // Clear token
      this.loggedIn.next(false); // Update login state
      localStorage.removeItem('authToken'); // Remove from local storage
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  get currentToken(): string | null {
    return this.tokenSubject.value;
  }
}
