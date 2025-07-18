import { Component } from '@angular/core';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent {
  isSubmitting = false;

  bookingData = {
    fullName: '',
    email: '',
    phone: '',
    travelDate: '',
    destination: '',
    notes: '',
  };

  constructor(private bookingService: BookingService) {}

  // Validation methods
  validateEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePhone(phone: string) {
    const re = /^[0-8]{10}$/;
    return re.test(phone);
  }

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

      // ADD THIS: Actually create the booking
      await this.bookingService.createBooking(this.bookingData);

      // Success handling
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
