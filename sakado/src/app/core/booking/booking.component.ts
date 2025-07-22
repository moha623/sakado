import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { idToken } from '@angular/fire/auth';
import { Trip } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent implements OnInit {
  isSubmitting = false;
  trips: Trip[] = [];
  loading = true;
  bookingData = {
    fullName: '',
    email: '',
    phone: '',
    travelDate: '',
    destination: '',
    notes: '',
  };

  constructor(private bookingService: BookingService ,private tripService: TripService) {}


   async ngOnInit() {
    try {
       this.trips = await this.tripService.getTripsForCards();
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      this.loading = false;
    }
  }

  calculateDuration(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString( );
  }

  // scrollToForm() {
  //   const formElement = document.getElementById('section1');
  //   if (formElement) {
  //     formElement.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }

  getAvailabilityText(trip: Trip): string {
    const available = trip.maxParticipants - trip.participants;
    if (available <= 0) return 'مكتمل';
    if (available <= 3) return `متبقي ${available} مقاعد فقط`;
    return `متوفر (${trip.participants}/${trip.maxParticipants})`;
  }




  // Validation methods
  validateEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // validatePhone(phone: any) {
  //   const re = /^[0-8]{10}$/;
  //   return re.test(phone);
  // }

  async submitBooking() {
    this.isSubmitting = true;
    try {
      // Basic validation
      if (
        !this.bookingData.fullName ||
        !this.bookingData.email ||
        !this.bookingData.destination ||
        !this.bookingData.phone ||
        !this.bookingData.travelDate ||
        !this.bookingData.notes
      ) {
        alert('يرجى ملء الحقول المطلوبة');
        return;
      }

      if (!this.validateEmail(this.bookingData.email)) {
        alert('البريد الإلكتروني غير صالح');
        return;
      }

      // if (
      //   this.bookingData.phone &&
      //   !this.validatePhone(this.bookingData.phone)
      // ) {
      //   alert('رقم الجوال غير صالح');
      //   return;
      // }

     
      await this.bookingService.createBooking(this.bookingData);

 
      alert('تم إرسال طلب الحجز بنجاح! سنتواصل معك قريباً.');
      this.resetForm();
    } catch (error) {
      console.error('Booking error:', error);
      alert('حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.');
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    this.bookingData = {
      fullName: '',
      email: '',
      phone: '',
      travelDate: '',
      destination: '',
      notes: '',
    };
  }

  scrollToForm() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }

}
