import { Component, OnInit } from '@angular/core';
import { Booking, BookingDetails } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';
// import * as html2pdf from 'html2pdf.js';
@Component({
  selector: 'app-booking-management',
  standalone: false,
  templateUrl: './booking-management.component.html',
  styleUrl: './booking-management.component.scss'
})
export class BookingManagementComponent implements OnInit {

 bookings: Booking[] = [];
  availableTrips: string[] = [];
  statusFilter = 'all';
  tripFilter = 'all';
  selectedBooking: Booking | null = null;
  bookingDetails: BookingDetails | null = null;
  loading = false;

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.loadBookings();
    this.loadAvailableTrips();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getBookings().subscribe(bookings => {
      this.bookings = bookings;
      this.loading = false;
    });
  }

  loadAvailableTrips() {
    this.bookingService.getAvailableTrips().subscribe(trips => {
      this.availableTrips = trips;
    });
  }

  selectBooking(booking: Booking) {
    this.selectedBooking = booking;
    this.loading = true;
    this.bookingService.getBookingDetails(booking.id).subscribe(details => {
      this.bookingDetails = details;
      this.loading = false;
    });
  }

  getStatusClass(status: string) {
    return {
      'confirmed': 'status-confirmed',
      'pending': 'status-pending',
      'cancelled': 'status-cancelled'
    }[status] || '';
  }

  getStatusText(status: string) {
    const statusMap: { [key: string]: string } = {
      'confirmed': 'مؤكدة',
      'pending': 'في الانتظار',
      'cancelled': 'ملغاة'
    };
    return statusMap[status] || status;
  }

  addNewBooking() {
    // In a real app, this would open a modal/dialog
    alert('سيتم فتح نموذج حجز جديد');
  }

  downloadPDF() {
    if (!this.selectedBooking) return;
    
    const element = document.getElementById('bookingManagement');
    const options = {
      margin: 10,
      filename: `booking-${this.selectedBooking.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // html2pdf().from(element).set(options).save();
  }

  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleDateString('ar-SA', options).replace(/\//g, '-');
  }




}
