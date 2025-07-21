import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Trip } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';
import { serverTimestamp } from 'firebase/firestore';
@Component({
  selector: 'app-package-management',
  standalone: false,
  templateUrl: './package-management.component.html',
  styleUrl: './package-management.component.scss',
})


export class PackageManagementComponent implements OnInit {
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

  currentPage = 1;
  pageSize = 3;
  lastDoc: any = null;
  totalPages = 0;
  totalItems = 0;
  pageSizes = [5, 10, 20];

  categories = ['شاطئية', 'جبلية', 'ثقافية', 'مغامرات', 'تسوق'];
  statusOptions = ['نشطة', 'مكتملة', 'ملغية'];

  loading = true;
  constructor(private tripService: TripService) {}

  ngOnInit() {
    // Use setTimeout to ensure DI is fully initialized
    setTimeout(() => {
      this.loadTrips();
    },1000);
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
  loadTrips() {
        this.loading = true;
    this.tripService
      .getTrips(this.pageSize, this.lastDoc)
      .subscribe((result: any) => {
        this.trips = result.trips;
        this.lastDoc = result.lastDoc;
        // Update pagination controls
        this.calculateTotalPages();

      });
    
      this.loading = false;
   
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

// your.component.ts
async deleteTrip(tripId: string) {
  if (!confirm('هل أنت متأكد من حذف هذه الرحلة؟')) return;
  
  try {
    await this.tripService.deleteTrip(tripId);
    // Ensure correct ID comparison
    const initialLength = this.trips.length;
    this.trips = this.trips.filter(t => t.id === tripId);
    
    if (initialLength === this.trips.length) {
      console.warn('Trip not found in local array:', tripId);
    }
  } catch (error) {
    console.error('Deletion failed:', error);
    alert('حدث خطأ: '  );
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

  calculateTotalPages() {
 
    this.tripService.getTotalTrips().subscribe((count) => {
      this.totalPages = count;
      console.log('Total documents in trips:', count);
    });
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
      // To go back, we need to re-fetch from beginning
      this.lastDoc = null;
      this.loadTrips();
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.lastDoc = null;
    this.loadTrips();
  }
}
