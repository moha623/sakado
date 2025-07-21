import { Injectable } from '@angular/core';
 
import { Trip } from '../models/trip.model';
import { from, Observable } from 'rxjs';
import { 
  Firestore, 
  addDoc, 
  collection, 
 docData,
  doc,
  deleteDoc,
  getCountFromServer
} from '@angular/fire/firestore';
 import { serverTimestamp } from 'firebase/firestore';
 import { query,  orderBy, limit as fsLimit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from '@angular/fire/firestore';
 
import { map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class TripService {
  constructor(private    firestore: Firestore,) {}

  async addTrip(trip: Trip): Promise<string> {
    try {
      const tripsCollection = collection(this.firestore, 'trips');
      const docRef = await addDoc(tripsCollection, {
        ...trip,
        createdAt: serverTimestamp(),
        participants: trip.participants || 0,
        status: trip.status || 'active'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  }

getTrips(pageSize: number, lastDoc?: QueryDocumentSnapshot<DocumentData>): Observable<{trips: Trip[], lastDoc: QueryDocumentSnapshot<DocumentData> | null}> {
  let tripsQuery = query(
    collection(this.firestore, 'trips'),
    orderBy('name'),    // Replace with your sort field, must be indexed in Firestore!
    fsLimit(pageSize),
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  );

  return from(getDocs(tripsQuery)).pipe(
    map(snapshot => {
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Trip));
      const nextLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length-1] : null;
      return { trips, lastDoc: nextLastDoc };
    })
  );
}
deleteTrip(tripId: string): Promise<void> {
  const tripDoc = doc(this.firestore, `trips/${tripId}`);
  return deleteDoc(tripDoc);
}
getTotalTrips() {
  const tripsRef = collection(this.firestore, 'trips');
  const q = query(tripsRef); // Add .where(...) here if you want filters

  // getCountFromServer returns a promise, wrap in from() to make Observable
  return from(getCountFromServer(q)).pipe(
    map(snapshot => snapshot.data().count as number)
  );
}

 async getTripsForCards(): Promise<Trip[]> {
    const tripsRef = collection(this.firestore, 'trips');
    const snapshot = await getDocs(tripsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Trip
    }));
  }
}
