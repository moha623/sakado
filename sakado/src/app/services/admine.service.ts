// data.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdmineService {
  constructor(private firestore: AngularFirestore) {}

  getPaginatedData(limit: number, lastDoc?: any): Observable<any[]> {
    let query = this.firestore.collection('trips', ref => {
      let q = ref.orderBy('createdAt').limit(limit);
      if (lastDoc) q = q.startAfter(lastDoc);
      return q;
    });
    
    return query.valueChanges({ idField: 'id' });
  }

  getCount(): Observable<number> {
    return this.firestore.collection('trips').valueChanges().pipe(map(items => items.length));
  }
}
