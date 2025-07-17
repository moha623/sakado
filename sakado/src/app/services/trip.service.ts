import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Trip } from '../models/trip.model';
import { Observable } from 'rxjs';
import { 
  Firestore, 
  addDoc, 
  collection, 
  collectionData,
  doc,
  deleteDoc
} from '@angular/fire/firestore';
 import { serverTimestamp } from 'firebase/firestore';
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

  getTrips(): Observable<Trip[]> {
    const tripsCollection = collection(this.firestore, 'trips');
    return collectionData(tripsCollection, { idField: 'id' }) as Observable<Trip[]>;
  }

  deleteTrip(tripId: string): Promise<void> {
    const tripDoc = doc(this.firestore, `trips/${tripId}`);
    return deleteDoc(tripDoc);
  }
}