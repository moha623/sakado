import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Booking } from '../models/booking.model';
 import { DocumentSnapshot, getCountFromServer, limit, orderBy, query, serverTimestamp, startAfter } from 'firebase/firestore';
import { async, from, map, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(private firestore: Firestore) { }

  private totalBookingsCache: number | null = null;

    async createBooking(bookingData: any) {
    try {
      const bookingWithMetadata = {
        ...bookingData,
        createdAt: serverTimestamp(),
        status: 'pending' // Default status
      };
      
      const bookingsRef = collection(this.firestore, 'bookings');
      await addDoc(bookingsRef, bookingWithMetadata);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error; // Rethrow to handle in component
    }
  } 
 
 async getBookings(pageSize: number, lastDoc: DocumentSnapshot | null): Promise<{ 
    bookings: any[], 
    lastDoc: DocumentSnapshot | null 
  }> {
    const bookingsRef = collection(this.firestore, 'bookings');
    let q = query(
      bookingsRef,
      orderBy('createdAt'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      bookings,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  }

  async getTotalBookings(): Promise<number> {
    if (this.totalBookingsCache === null) {
      const bookingsRef = collection(this.firestore, 'bookings');
      const snapshot = await getCountFromServer(bookingsRef);
      this.totalBookingsCache = snapshot.data().count;
    }
    return this.totalBookingsCache;
  }

  invalidateCache() {
    this.totalBookingsCache = null;
  }

  

 
 

  async updateBooking(booking: Booking): Promise<void> {
    const bookingDoc = doc(this.firestore, `bookings/${booking.id}`);
    await updateDoc(bookingDoc, {...booking});
  }

  async deleteBooking(id: string): Promise<void> {
    const bookingDoc = doc(this.firestore, `bookings/${id}`);
    await deleteDoc(bookingDoc);
  }
}