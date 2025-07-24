import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';
import { DocumentSnapshot } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-booking-management',
  standalone: false,
  templateUrl: './booking-management.component.html',
  styleUrls: ['./booking-management.component.scss'],
})
export class BookingManagementComponent implements OnInit {
  // Pagination
  currentPage = 1;
  pageSize = 5;
  cursors: (DocumentSnapshot | null)[] = [null];
  totalPages = 0;
  totalItems = 0;
  pageSizes = [5, 10, 20];

  // Data
  filteredBookings: Booking[] = [];
  uniqueDestinations: string[] = [];
  loading = true;

  // UI States
  showModal = false;
  showDeleteConfirmation = false;
  selectedBooking: Booking | null = null;
  bookingToDelete: Booking | null = null;
  editingBooking: Booking | null = null;
  newBooking: Partial<Booking> = { status: 'pending' };

  // Filters
  statusFilter = 'all';
  destinationFilter = 'all';

  private filterSubject = new Subject<void>();

  constructor(private bookingService: BookingService) {}
  ngOnInit() {
    this.loadInitialData();
    this.filterSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.reloadData());
  }

  // Add this method
  onFilterChange() {
    this.filterSubject.next();
  }

  // Add this method
  async deleteBooking() {
    if (this.bookingToDelete) {
      try {
        await this.bookingService.deleteBooking(this.bookingToDelete.id!);
        this.showDeleteConfirmation = false;

        // Clear selection if deleted booking was selected
        if (this.selectedBooking?.id === this.bookingToDelete.id) {
          this.selectedBooking = null;
        }

        this.bookingToDelete = null;
        this.reloadData();
        alert('تم حذف الحجز بنجاح!');
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('حدث خطأ أثناء حذف الحجز!');
      }
    }
  }

  async saveBooking(booking?: Booking | Partial<Booking>) {
    try {
      let bookingToSave: Booking | Partial<Booking> | null = null;

      if (booking) {
        bookingToSave = booking;
      } else {
        bookingToSave = this.editingBooking || this.newBooking;
      }

      if (bookingToSave) {
        // Ensure all required fields have values
        const sanitizedBooking: any = {
          ...bookingToSave,
          fullName: bookingToSave.fullName || '',
          email: bookingToSave.email || '',
          phone: bookingToSave.phone || '',
          destination: bookingToSave.destination || '',
          ticketCount: bookingToSave.ticketCount || 0, // Default to 0
          totalPrice: bookingToSave.totalPrice || 0, // Default to 0
          status: bookingToSave.status || 'pending',
          notes: bookingToSave.notes || '',
          updatedAt: new Date(),
        };

        // Add createdAt for new bookings
        if (!bookingToSave.id) {
          sanitizedBooking.createdAt = new Date();
        }

        if (bookingToSave.id) {
          await this.bookingService.updateBooking(sanitizedBooking as Booking);
          alert('تم تحديث الحجز بنجاح!');
        } else {
          await this.bookingService.createBooking(sanitizedBooking);
          alert('تم إنشاء الحجز بنجاح!');
        }

        this.closeModal();
        this.reloadData();
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('حدث خطأ أثناء العملية!');
    }
  }

  handleBookingAction(
    booking: Booking,
    action: 'view' | 'edit' | 'delete',
    event?: Event
  ) {
    event?.stopPropagation();

    switch (action) {
      case 'view':
        this.selectedBooking = { ...booking };
        // Scroll to details panel
        this.scrollToSection('booking-header');
        break;
      case 'edit':
        this.openModal(booking);
        break;
      case 'delete':
        this.bookingToDelete = booking;
        this.showDeleteConfirmation = true;
        break;
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openModal(booking?: Booking) {
    if (booking) {
      this.editingBooking = {
        ...booking,
        travelDate: this.toDate(booking.travelDate),
      };
    } else {
      this.newBooking = {
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        travelDate: new Date(), // Add initial travel date
      };
      this.editingBooking = null;
    }
    this.showModal = true;
  }

  // Add this helper method to the component
  private toDate(value: any): Date {
    return value instanceof Date ? value : new Date(value);
  }

  reloadData() {
    this.currentPage = 1;
    this.cursors = [null];
    this.loadInitialData();
  }

  async loadInitialData() {
    this.loading = true;
    try {
      const filters = {
        status: this.statusFilter,
        destination: this.destinationFilter,
      };
      this.uniqueDestinations =
        await this.bookingService.getUniqueDestinations();
      this.totalItems = await this.bookingService.getTotalBookings(filters);
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      await this.loadBookings();
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }

  async loadBookings() {
    try {
      const filters = {
        status: this.statusFilter,
        destination: this.destinationFilter,
      };
      const result = await this.bookingService.getBookings(
        this.pageSize,
        this.cursors[this.currentPage - 1],
        filters
      );

      this.filteredBookings = result.bookings;

      if (result.bookings.length) {
        this.cursors[this.currentPage] = result.lastDoc;
      }
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        // Try without filters
        const result = await this.bookingService.getBookings(
          this.pageSize,
          this.cursors[this.currentPage - 1],
          { status: 'all', destination: 'all' }
        );
        this.filteredBookings = result.bookings;
        alert(
          'المرجو إنشاء الفهرس في كونسول فايربيز لتتمكن من استخدام الفلاتر'
        );
      } else {
        console.error('Error loading bookings:', err);
      }
    } finally {
      this.loading = false;
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingBooking = null;
    this.newBooking = { status: 'pending' };
  }

  // Status helpers
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      confirmed: 'مؤكدة',
      pending: 'في الانتظار',
      cancelled: 'ملغاة',
    };
    return statusMap[status] || status;
  }

  // Pagination controls
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadBookings();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadBookings();
    }
  }

  async changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.cursors = [null];
    await this.loadInitialData();
  }
}
