import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-booking-management',
   standalone: false,
  templateUrl: './booking-management.component.html',
  styleUrls: ['./booking-management.component.scss']
})
export class BookingManagementComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedBooking: Booking | null = null;
  statusFilter = 'all';
  destinationFilter = 'all';
  uniqueDestinations: string[] = [];
  loading = true;
  showModal = false;
  showDeleteConfirmation = false;
  bookingToDelete: Booking | null = null;
  editingBooking: Booking | null = null;
  newBooking: Partial<Booking> = {
    status: 'pending'
  };

  constructor(
    private bookingService: BookingService,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  async loadBookings() {
    this.loading = true;
    try {
      this.bookings = await this.bookingService.getBookings();
      this.filteredBookings = [...this.bookings];
      this.extractUniqueDestinations();
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      this.loading = false;
    }
  }

  extractUniqueDestinations() {
    this.uniqueDestinations = [...new Set(this.bookings.map(b => b.destination))];
  }

  applyFilters() {
    this.filteredBookings = this.bookings.filter(booking => {
      const statusMatch = this.statusFilter === 'all' || booking.status === this.statusFilter;
      const destinationMatch = this.destinationFilter === 'all' || 
                              booking.destination === this.destinationFilter;
      return statusMatch && destinationMatch;
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'confirmed': return 'مؤكدة';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  }

  selectBooking(booking: Booking) {
    this.selectedBooking = {...booking};
  }

  viewBooking(booking: Booking, event: Event) {
    event.stopPropagation();
    this.selectedBooking = {...booking};
  }

  editBooking(booking: Booking, event: Event) {
    event.stopPropagation();
    this.editingBooking = {...booking};
    this.showModal = true;
  }

  openCreateModal() {
    this.newBooking = {
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.editingBooking = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingBooking = null;
  }

  async createBooking() {
    if (this.newBooking) {
      try {
        await this.bookingService.createBooking(this.newBooking as Booking);
        this.closeModal();
        this.loadBookings();
        alert('تم إنشاء الحجز بنجاح!');
      } catch (error) {
        console.error('Error creating booking:', error);
        alert('حدث خطأ أثناء إنشاء الحجز!');
      }
    }
  }

  async updateBooking() {
    if (this.selectedBooking) {
      try {
        // Add updated timestamp
        this.selectedBooking.updatedAt = new Date();
        
        await this.bookingService.updateBooking(this.selectedBooking);
        
        if (this.showModal) {
          this.closeModal();
        }
        
        this.loadBookings();
        alert('تم تحديث الحجز بنجاح!');
      } catch (error) {
        console.error('Error updating booking:', error);
        alert('حدث خطأ أثناء تحديث الحجز!');
      }
    }
  }

  confirmDelete(booking: Booking, event: Event) {
    event.stopPropagation();
    this.bookingToDelete = booking;
    this.showDeleteConfirmation = true;
  }

  async deleteBooking() {
    if (this.bookingToDelete) {
      try {
        await this.bookingService.deleteBooking(this.bookingToDelete.id!);
        this.showDeleteConfirmation = false;
        
        // Clear selection if deleted booking was selected
        if (this.selectedBooking?.id === this.bookingToDelete.id) {
          this.selectedBooking = null;
        }
        
        this.loadBookings();
        alert('تم حذف الحجز بنجاح!');
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('حدث خطأ أثناء حذف الحجز!');
      }
    }
  }

  async changeBookingStatus() {
    if (this.selectedBooking) {
      try {
        this.selectedBooking.updatedAt = new Date();
        await updateDoc(doc(this.firestore, 'bookings', this.selectedBooking.id!), {
          status: this.selectedBooking.status,
          updatedAt: new Date()
        });
        this.loadBookings();
        alert('تم تغيير حالة الحجز بنجاح!');
      } catch (error) {
        console.error('Error changing booking status:', error);
        alert('حدث خطأ أثناء تغيير حالة الحجز!');
      }
    }
  }
}