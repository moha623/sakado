import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Trip } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';
import { serverTimestamp } from 'firebase/firestore';
import { DocumentSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-package-management',
  standalone: false,
  templateUrl: './package-management.component.html',
  styleUrl: './package-management.component.scss',
})
export class PackageManagementComponent implements OnInit {
  uniqueDestinations: string[] = [];

  currentPage = 1;
  pageSize = 5; // Fixed to 5 elements per page
  cursors: (DocumentSnapshot | null)[] = [null]; // Document snapshots for pagination
  totalPages = 0;
  totalItems = 0;
  pageSizes = [5, 10, 20];

  trips: Trip[] = [];
  newTrip: Trip = {
    name: '',
    category: '',
    destination: '',
    price: 0,
    status: 'active',
    participants: 0,
    maxParticipants: 20,
    description: '',
    itinerary: '',
    startDate: new Date(),
    endDate: new Date(),
  };

  categories = ['شاطئية', 'جبلية', 'ثقافية', 'مغامرات', 'تسوق'];
  statusOptions = ['نشطة', 'مكتملة', 'ملغية'];

  loading = true;

  bookings: any;
  constructor(private tripService: TripService) {}

  ngOnInit() {
    this.loadInitialData();
    setTimeout(() => {
      this.loadTrips();
    }, 1000);
  }

  // loadTrips() {
  //   this.tripService.getTrips().subscribe({
  //     next: (trips) => {
  //       this.trips = trips;
  //     },
  //     error: (err) => {
  //       console.error('Error loading trips:', err);
  //       alert('حدث خطأ أثناء تحميل الرحلات');
  //     },
  //   });
  // }
  async loadTrips() {
    try {
     const lastDoc = this.cursors[this.currentPage - 1];
      const result = await this.tripService.getTrips(
        this.pageSize,lastDoc
         
      );
      this.trips = result.trips;
      this.extractUniqueDestinations();

      // Update cursor for next page
      if (result.trips.length > 0) {
        this.cursors[this.currentPage] = result.lastDoc;
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      this.loading = false;
    }
  }

  extractUniqueDestinations() {
    this.uniqueDestinations = [
      ...new Set(this.trips.map((b) => b.destination)),
    ];
  }
  scrollToForm() {
    document.getElementById('section1')?.scrollIntoView({ behavior: 'smooth' });
  }

  async addTrip(tripData: Trip) {
    try {
      // Add server timestamp and default values
      const tripWithMetadata = {
        ...tripData,
        createdAt: serverTimestamp(),
        status: tripData.status || 'active',
        participants: tripData.participants || 0,
      };

      // Call service to add trip
      await this.tripService.addTrip(tripWithMetadata);
      if (
        !this.newTrip.category ||
        !this.newTrip.description ||
        !this.newTrip.name ||
        !this.newTrip.destination ||
        !this.newTrip.price ||
        !this.newTrip.startDate ||
        !this.newTrip.endDate
      ) {
        alert('يرجى ملء الحقول المطلوبة');
        return;
      }
      alert('تم إضافة الرحلة بنجاح!');
      this.resetForm();
      this.loadTrips();
    } catch (error) {
      console.error('Error adding trip:', error);
      alert('حدث خطأ أثناء إضافة الرحلة!');
    }
  }

  addNewTrip() {
    this.addTrip(this.newTrip);
  }

  async deleteTrip(tripId: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الرحلة؟')) return;

    try {
      await this.tripService.deleteTrip(tripId);
      // Ensure correct ID comparison
      const initialLength = this.trips.length;
      this.trips = this.trips.filter((t) => t.id === tripId);

      if (initialLength === this.trips.length) {
        console.warn('Trip not found in local array:', tripId);
      }
    } catch (error) {
      console.error('Deletion failed:', error);
      alert('حدث خطأ: ');
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'نشطة';
      case 'completed':
        return 'مكتملة';
      case 'cancelled':
        return 'ملغية';
      default:
        return status;
    }
  }

  getStatusValue(text: string): string {
    switch (text) {
      case 'نشطة':
        return 'active';
      case 'مكتملة':
        return 'completed';
      case 'ملغية':
        return 'cancelled';
      default:
        return text;
    }
  }

  private resetForm() {
    this.newTrip = {
      name: '',
      category: '',
      destination: '',
      price: 0,
      status: 'active',
      participants: 0,
      maxParticipants: 20,
      description: '',
      itinerary: '',
      startDate: new Date(),
      endDate: new Date(),
    };
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTrips();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTrips();
    }
  }
  async loadInitialData() {
    this.loading = true;
    try {
      this.totalItems = await this.tripService.getTotalTrips();
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      await this.loadTrips();
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }
  async changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.cursors = [null];
    this.tripService.invalidateCache();
    await this.loadTrips();
  }
}
