import { Component, OnInit,   } from '@angular/core';
import { Trip } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';
 
import { DocumentSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-package-management',
  standalone: false,
  templateUrl: './package-management.component.html',
  styleUrl: './package-management.component.scss',
})
export class PackageManagementComponent implements OnInit {
  // Pagination
  currentPage = 1;
  pageSize = 5;
  cursors: (DocumentSnapshot | null)[] = [null];
  totalPages = 0;
  totalItems = 0;
  pageSizes = [5, 10, 20];

  // Data
  trips: Trip[] = [];
  loading = true;
  
  // Form
  currentTrip: Trip = this.createEmptyTrip();
  editingTrip: Trip | null = null;
  
  // UI States
  showDeleteConfirmation = false;
  tripToDelete: Trip | null = null;
  
  // Options
  categories = ['شاطئية', 'جبلية', 'ثقافية', 'مغامرات', 'تسوق'];
  statusOptions = ['نشطة', 'مكتملة', 'ملغية'];
 
  // Status mapping
  statusMap: { [key: string]: string } = {
    'نشطة': 'active',
    'مكتملة': 'completed',
    'ملغية': 'cancelled'
  };


  
  constructor(private tripService: TripService) {}

  ngOnInit() {
    this.loadInitialData();
  }

  // Create empty trip template
  createEmptyTrip(): Trip {
    return {
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

  // Reset form to initial state
  resetForm() {
    this.currentTrip = this.createEmptyTrip();
    this.editingTrip = null;
  }

  // Load initial data
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

  // Load trips with pagination
  async loadTrips() {
    try {
      const lastDoc = this.cursors[this.currentPage - 1];
      const result = await this.tripService.getTrips(this.pageSize, lastDoc);
      this.trips = result.trips;
      
      if (result.trips.length) {
        this.cursors[this.currentPage] = result.lastDoc;
      }
    } catch (err) {
      console.error('Error loading trips:', err);
    } finally {
      this.loading = false;
    }
  }

  // Save or update trip
  async saveTrip() {
    if (!this.validateTrip()) {
      alert('يرجى ملء الحقول المطلوبة');
      return;
    }

    try {
      if (this.editingTrip && this.editingTrip.id) {
        await this.tripService.updateTrip(this.currentTrip);
        alert('تم تحديث الرحلة بنجاح!');
      } else {
        await this.tripService.addTrip(this.currentTrip);
        alert('تم إضافة الرحلة بنجاح!');
      }
      this.resetForm();
      this.loadTrips();
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('حدث خطأ أثناء العملية!');
    }
  }

  // Validate required fields
  validateTrip(): boolean {
    return !!this.currentTrip.name &&
           !!this.currentTrip.category &&
           !!this.currentTrip.destination &&
           this.currentTrip.price > 0 &&
           !!this.currentTrip.description;
  }

  // Edit trip
  editTrip(trip: Trip) {
    this.editingTrip = trip;
    this.currentTrip = { ...trip };
    this.scrollToForm();
  }

confirmDelete(trip: Trip) {
  this.tripToDelete = trip;
  this.showDeleteConfirmation = true;
}

async deleteTrip() {
  if (!this.tripToDelete?.id) return;
  
  try {
    await this.tripService.deleteTrip(this.tripToDelete.id);
    this.trips = this.trips.filter(t => t.id !== this.tripToDelete?.id);
    this.showDeleteConfirmation = false;
    this.tripToDelete = null;
    alert('تم حذف الرحلة بنجاح!');
  } catch (error) {
    console.error('Deletion failed:', error);
    alert('حدث خطأ أثناء الحذف!');
  }
}

  // Status helpers
  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'active': 'status-active',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return classMap[status] || '';
  }

  getStatusText(status: string): string {
    const textMap: { [key: string]: string } = {
      'active': 'نشطة',
      'completed': 'مكتملة',
      'cancelled': 'ملغية'
    };
    return textMap[status] || status;
  }

  // Pagination controls
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

  async changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.cursors = [null];
    await this.loadTrips();
  }

  scrollToForm() {
    document.getElementById('section1')?.scrollIntoView({ behavior: 'smooth' });
  }
}