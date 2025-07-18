// // booking.service.ts
// import { Injectable } from '@angular/core';
// import { of } from 'rxjs';
// import { delay } from 'rxjs/operators';
// import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';


// @Injectable({
//   providedIn: 'root'
// })
// export class BookingService {
//   // getBookings() {
//   //   return of([
//   //     { id: 'BK001', trip: 'رحلة جبلية', participant: 'محمد أحمد', date: '2023-10-15', amount: 250, status: 'confirmed' },
//   //     { id: 'BK002', trip: 'رحلة بحرية', participant: 'سارة خالد', date: '2023-10-18', amount: 350, status: 'pending' },
//   //     { id: 'BK003', trip: 'رحلة صحراوية', participant: 'علي حسن', date: '2023-10-20', amount: 400, status: 'confirmed' },
//   //     { id: 'BK004', trip: 'رحلة جبلية', participant: 'فاطمة عمر', date: '2023-10-22', amount: 250, status: 'cancelled' },
//   //     { id: 'BK005', trip: 'رحلة بحرية', participant: 'نورا سعيد', date: '2023-10-25', amount: 350, status: 'pending' },
//   //   ]).pipe(delay(500));
//   // }

//   // getBookingDetails(id: string) {
//   //   const details = {
//   //     tripName: 'رحلة جبلية',
//   //     tripDate: '2023-11-15',
//   //     bookingDate: '2023-10-15',
//   //     lastUpdate: '2023-10-16',
//   //     totalAmount: 250,
//   //     paymentStatus: 'مدفوع',
//   //     participantInfo: {
//   //       fullName: 'محمد أحمد',
//   //       email: 'mohamed@example.com',
//   //       phone: '+966512345678',
//   //       idNumber: '1122334455',
//   //       emergencyContact: 'أحمد محمد',
//   //       emergencyPhone: '+966587654321',
//   //       medicalNotes: 'لا توجد ملاحظات'
//   //     },
//   //     participants: [
//   //       { name: 'محمد أحمد', email: 'mohamed@example.com', phone: '+966512345678', status: 'تم التسجيل' },
//   //       { name: 'سامي محمد', email: 'sami@example.com', phone: '+966511223344', status: 'لم يسجل بعد' },
//   //       { name: 'ليلى أحمد', email: 'layla@example.com', phone: '+966544332211', status: 'تم التسجيل' }
//   //     ]
//   //   };
//   //   return of(details).pipe(delay(300));
//   // }

//   // getAvailableTrips() {
//   //   return of(['رحلة جبلية', 'رحلة بحرية', 'رحلة صحراوية', 'رحلة سياحية']);
//   // }

//   constructor(private firestore: Firestore) { }



// }

import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(private firestore: Firestore) { }

  async getBookings(): Promise<Booking[]> {
    const bookingsRef = collection(this.firestore, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    return snapshot.docs.map(doc => ({
        id: doc.id,

      ...doc.data() as Booking
    }));
  }

  // async createBooking(booking: Booking): Promise<void> {
  //   const bookingsRef = collection(this.firestore, 'bookings');
  //   await addDoc(bookingsRef, booking);
  // }

    async createBooking(bookingData: any) {
    try {
      const bookingWithMetadata = {
        ...bookingData,
        // createdAt: serverTimestamp(),
        status: 'pending' // Default status
      };
      
      const bookingsRef = collection(this.firestore, 'bookings');
      await addDoc(bookingsRef, bookingWithMetadata);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error; // Rethrow to handle in component
    }
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