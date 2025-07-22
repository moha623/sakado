import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
 
  DocumentData,
  serverTimestamp,
   
} from '@angular/fire/firestore';
 import { DocumentSnapshot, QueryDocumentSnapshot,   } from 'firebase/firestore';
@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor(private firestore: Firestore) {}

  private totalTripsCache: number | null = null;

  // Add a new trip and return the doc ID
  async addTrip(trip: Trip): Promise<string> {
      
    try {
      const tripsRef = collection(this.firestore, 'trips');
      const docRef = await addDoc(tripsRef, {
        ...trip,
        createdAt: serverTimestamp(),
        participants: trip.participants || 0,
        status: trip.status || 'active',
      });
      this.invalidateCache();
      return docRef.id;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  }

  // Update existing trip by id
  async updateTrip(trip: Trip): Promise<void> {
    const tripDoc = doc(this.firestore, `trips/${trip.id}`);
    await updateDoc(tripDoc, { ...trip });
    this.invalidateCache();
  }

  // Delete trip by id
  async deleteTrip(tripId: string): Promise<void> {
    const tripDoc = doc(this.firestore, `trips/${tripId}`);
    await deleteDoc(tripDoc);
    this.invalidateCache();
  }

  // Paginated fetch: pageSize and optional last document for cursor
  async getTrips(
    pageSize: number,
  lastDoc: DocumentSnapshot | null 
  ): Promise<{ trips: Trip[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    let tripsRef = collection(this.firestore, 'trips');
    let q = query(tripsRef, orderBy('name'), limit(pageSize));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const trips = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Trip),
    }));

    const nextLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { trips, lastDoc: nextLastDoc };
  }

  // Get total number of trips with caching
  async getTotalTrips(): Promise<number> {
    if (this.totalTripsCache === null) {
      const tripsRef = collection(this.firestore, 'trips');
      const snapshot = await getCountFromServer(tripsRef);
      this.totalTripsCache = snapshot.data().count;
    }
    return this.totalTripsCache;
  }

  // Invalidate the cached total count when data changes
  invalidateCache() {
    this.totalTripsCache = null;
  }

  // Get all trips (without pagination), useful for cards or dropdowns
  async getTripsForCards(): Promise<Trip[]> {
    const tripsRef = collection(this.firestore, 'trips');
    const snapshot = await getDocs(tripsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Trip),
    }));
  }
}
