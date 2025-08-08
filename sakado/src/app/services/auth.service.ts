 
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
import { HttpClient } from '@angular/common/http';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { deleteDoc } from '@angular/fire/firestore'; // Add this import 
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
 
  private loggedIn: BehaviorSubject<boolean>;
  loggedIn$: Observable<boolean>;
  private totalUsersCache: number | null = null;

    private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();


  constructor(private auth: Auth, private firestore: Firestore, private http: HttpClient  ) {
     this.initAuthState();
    this.loggedIn$ = this.currentUser$.pipe(map(user => !!user));
    this.loggedIn = new BehaviorSubject<boolean>(
      this.tokenSubject.value !== null
    );
   
  }
  private fetchUserProfile(): void {
    const user = this.auth.currentUser;
    if (!user) return;

    const userDoc = doc(this.firestore, `users/${user.uid}`);
    getDoc(userDoc).then(snapshot => {
      if (snapshot.exists()) {
        this.currentUserSubject.next({
          uid: user.uid,
          ...snapshot.data() as User
        });
      }
    });
  }
  private initAuthState(): void {
    // Initialize from localStorage
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) this.tokenSubject.next(storedToken);
    
    // Listen for auth state changes
    idToken(this.auth).subscribe(token => {
      this.tokenSubject.next(token);
      if (token) {
        localStorage.setItem('authToken', token);
        this.fetchUserProfile();
      } else {
        localStorage.removeItem('authToken');
        this.currentUserSubject.next(null);
      }
    });
  }

  register(
    email: string,
    password: string,
    userData: { username: string; lastname: string; number: string; role: 'user' | 'admin' }
  ): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCred => {
        const userProfile: User = {
          email,
          createdAt: new Date(),
          ...userData
        };

        return from(setDoc(
          doc(this.firestore, `users/${userCred.user.uid}`),
          userProfile
        )).pipe(
          map(() => userProfile),
          tap(() => this.currentUserSubject.next(userProfile))
        );
      })
    );
  }

  // Update login to fetch profile
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(() => {
        return new Observable<User>(observer => {
          const unsubscribe = this.currentUser$.subscribe(user => {
            if (user) {
              observer.next(user);
              observer.complete();
              unsubscribe.unsubscribe();
              console.log(user.role)
            }
          });
        });
      })
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
 
  get currentUserRole(): 'user' | 'admin' | null {
    return this.currentUserSubject.value?.role || null;
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
  try {
    // Delete from Firestore
    const userDoc = doc(this.firestore, `users/${uid}`);
    await deleteDoc(userDoc);
    
    // Call Cloud Function to delete auth user
    await this.callDeleteUserFunction(uid);
    
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

private async callDeleteUserFunction(uid: string): Promise<void> {
  // Replace with your actual Cloud Function URL
  const functionUrl = `https://your-region-your-project-id.cloudfunctions.net/deleteUser`;
  
  // Call the Cloud Function
  return this.http.post(functionUrl, { uid }).toPromise()
    .then(() => console.log('User deleted from authentication'))
    .catch(err => {
      console.error('Cloud Function error:', err);
      throw err;
    });
}
}
