import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Booking } from '../models/booking.model';
import { DocumentSnapshot, getCountFromServer, limit, orderBy, query, serverTimestamp, startAfter, where } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private firestore: Firestore) {}

  async createBooking(bookingData: any) {
    const bookingWithMetadata = {
      ...bookingData,
      createdAt: serverTimestamp(),
      status: 'pending'
    };

    const bookingsRef = collection(this.firestore, 'bookings');
    return addDoc(bookingsRef, bookingWithMetadata);
  }

async getBookings(
  pageSize: number, 
  lastDoc: DocumentSnapshot | null, 
  filters: { status: string; destination: string }
) {
  const bookingsRef = collection(this.firestore, 'bookings');
  
  // Base query with order
  let q = query(bookingsRef, orderBy('createdAt', 'desc'));
  
  // Apply filters
  const conditions = [];
  if (filters.status !== 'all') {
    conditions.push(where('status', '==', filters.status));
  }
  if (filters.destination !== 'all') {
    conditions.push(where('destination', '==', filters.destination));
  }
  
  // Add all conditions at once
  if (conditions.length > 0) {
    q = query(q, ...conditions);
  }
  
  // Add pagination
  q = query(q, limit(pageSize));
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => this.mapToBooking(doc));

    return {
      bookings,
      lastDoc: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  }
// booking.service.ts
private toDate(value: any): Date {
  if (!value) return new Date();
  
  // If it's a Firestore Timestamp
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  
  // If it's a JavaScript Date object
  if (value instanceof Date) {
    return value;
  }
  
  // If it's a string representation
  if (typeof value === 'string') {
    return new Date(value);
  }
  
  // If it's a timestamp number
  if (typeof value === 'number') {
    return new Date(value);
  }
  
  // Fallback to current date
  return new Date();
}
 private mapToBooking(doc: any): Booking {
  const data = doc.data();
  return {
    id: doc.id,
    fullName: data['fullName'],
    email: data['email'],
    phone: data['phone'],
    travelDate: this.toDate(data['travelDate']),
    destination: data['destination'],
    ticketCount: data['ticketCount'],
    totalPrice: data['totalPrice'],
    status: data['status'] || 'pending',
    notes: data['notes'] || '',
    createdAt: this.toDate(data['createdAt']),
    updatedAt: this.toDate(data['updatedAt'])
  } as Booking;
}
  async getTotalBookings(filters: { status: string; destination: string }): Promise<number> {
    const bookingsRef = collection(this.firestore, 'bookings');
    let q = query(bookingsRef);

    if (filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.destination !== 'all') {
      q = query(q, where('destination', '==', filters.destination));
    }

    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  async getUniqueDestinations(): Promise<string[]> {
    const bookingsRef = collection(this.firestore, 'bookings');
    const q = query(bookingsRef);
    const snapshot = await getDocs(q);
    const destinations = new Set<string>();
    
    snapshot.docs.forEach(doc => {
      const destination = doc.data()['destination'];
      if (destination) destinations.add(destination);
    });
    
    return Array.from(destinations);
  }

// booking.service.ts
async updateBooking(booking: Booking): Promise<void> {
  const bookingDoc = doc(this.firestore, `bookings/${booking.id}`);
  
  // Prepare update data with defaults for undefined values
  const updateData = {
    fullName: booking.fullName || '',
    email: booking.email || '',
    phone: booking.phone || '',
    travelDate: booking.travelDate || new Date(),
    destination: booking.destination || '',
    ticketCount: booking.ticketCount || 0,
    totalPrice: booking.totalPrice || 0,
    status: booking.status || 'pending',
    notes: booking.notes || '',
    updatedAt: new Date()
  };
  
  await updateDoc(bookingDoc, updateData);
}

  async deleteBooking(id: string): Promise<void> {
    const bookingDoc = doc(this.firestore, `bookings/${id}`);
    await deleteDoc(bookingDoc);
  }
}