import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  idToken,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  setDoc,
  query,
  limit,
  startAfter,
  deleteDoc,
} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public loggedIn$: Observable<boolean>;

  private totalUsersCache: number | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loggedIn$ = this.currentUser$.pipe(map((user) => !!user));
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn(
        'AuthService: Running on server, skipping localStorage access'
      );
      return;
    }

    // Initialize from localStorage if available
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) this.tokenSubject.next(storedToken);

    // Subscribe to Firebase ID token changes
    idToken(this.auth).subscribe({
      next: (token) => {
        this.tokenSubject.next(token);
        if (token) {
          localStorage.setItem('authToken', token);
          this.loadUserProfile();
        } else {
          localStorage.removeItem('authToken');
          this.currentUserSubject.next(null);
        }
      },
      error: () => {
        localStorage.removeItem('authToken');
        this.currentUserSubject.next(null);
      },
    });
  }

  private loadUserProfile(): void {
    const user = this.auth.currentUser;
    if (!user) return;

    const userDoc = doc(this.firestore, `users/${user.uid}`);
    getDoc(userDoc).then((snapshot) => {
      if (snapshot.exists()) {
        this.currentUserSubject.next({
          uid: user.uid,
          ...(snapshot.data() as User),
        });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  register(
    email: string,
    password: string,
    userData: {
      username: string;
      lastname: string;
      number: string;
      role: 'user' | 'admin';
    }
  ): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap((userCred) => {
        const newUser: User = {
          email,
          createdAt: new Date(),
          ...userData,
        };
        return from(
          setDoc(doc(this.firestore, `users/${userCred.user.uid}`), newUser)
        ).pipe(
          tap(() => this.currentUserSubject.next(newUser)),
          map(() => newUser)
        );
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(
        () =>
          new Observable<User>((observer) => {
            const subscription = this.currentUser$.subscribe((user) => {
              if (user) {
                observer.next(user);
                observer.complete();
                subscription.unsubscribe();
              }
            });
          })
      )
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.tokenSubject.next(null);
        localStorage.removeItem('authToken');
      })
    );
  }

  get currentUserRole(): 'user' | 'admin' | null {
    return this.currentUserSubject.value?.role || null;
  }

  async getUsers(
    pageSize: number,
    lastDoc: any | null
  ): Promise<{ users: User[]; lastDoc: any | null }> {
    const usersCollection = collection(this.firestore, 'users');
    let q = query(usersCollection, limit(pageSize));
    if (lastDoc)
      q = query(usersCollection, startAfter(lastDoc), limit(pageSize));

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as User),
    }));
    const nextLastDoc = snapshot.docs.length
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

    return { users, lastDoc: nextLastDoc };
  }

  async getTotalUsers(): Promise<number> {
    if (this.totalUsersCache === null) {
      const usersCollection = collection(this.firestore, 'users');
      const snapshot = await getCountFromServer(usersCollection);
      this.totalUsersCache = snapshot.data().count;
    }
    return this.totalUsersCache;
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      // Delete Firestore user document
      const userDoc = doc(this.firestore, `users/${uid}`);
      await deleteDoc(userDoc);

      // Call Cloud Function to delete Auth user
      await this.callDeleteUserFunction(uid);
    } catch (error: unknown) {
      // Narrow unknown error type safely
      let errorMessage = 'Unknown error deleting user';
      if (error instanceof Error) errorMessage = error.message;
      console.error(`Error deleting user: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  private async callDeleteUserFunction(uid: string): Promise<void> {
    const functionUrl =
      'https://your-region-your-project-id.cloudfunctions.net/deleteUser';
    try {
      await this.http.post(functionUrl, { uid }).toPromise();
      console.log('User deleted from authentication');
    } catch (error: unknown) {
      let errorMessage = 'Cloud Function error';
      if (error instanceof Error) errorMessage = error.message;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
