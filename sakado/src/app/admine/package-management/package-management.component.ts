import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Trip } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { serverTimestamp } from 'firebase/firestore';
@Component({
  selector: 'app-package-management',
  standalone: false,
  templateUrl: './package-management.component.html',
  styleUrl: './package-management.component.scss',
})
// export class PackageManagementComponent implements OnInit {
//   trips: Trip[] = [];
//   categories: string[] = [];
//   statusOptions: string[] = [];
//   selectedFile: File | null = null;
//   imagePreview: string | ArrayBuffer | null = null;

//   newTrip: Trip = {
//     id: 0,
//     name: '',
//     category: '',
//     destination: '',
//     price: 0,
//     status: 'draft',
//     participants: '0/0',
//     maxParticipants: 20
//   };

//   constructor(private tripService: TripService) {}

//   ngOnInit() {
//     this.trips = this.tripService.getTrips();
//     this.categories = this.tripService.getCategories();
//     this.statusOptions = this.tripService.getStatusOptions();
//   }

//   addNewTrip() {
//     if (this.newTrip.name && this.newTrip.category && this.newTrip.destination) {
//       // Add image if selected
//       if (this.selectedFile) {
//         this.newTrip.image = URL.createObjectURL(this.selectedFile);
//       }

//       this.newTrip.participants = `0/${this.newTrip.maxParticipants}`;
//       this.tripService.addTrip(this.newTrip);
//       this.trips = this.tripService.getTrips();

//       // Reset form
//       this.newTrip = {
//         id: 0,
//         name: '',
//         category: '',
//         destination: '',
//         price: 0,
//         status: 'draft',
//         participants: '0/0',
//         maxParticipants: 20
//       };

//       // Clear file selection
//       this.selectedFile = null;
//       this.imagePreview = null;
//     }
//   }

//   onFileSelected(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.selectedFile = input.files[0];

//       // Create image preview
//       const reader = new FileReader();
//       reader.onload = () => {
//         this.imagePreview = reader.result;
//       };
//       reader.readAsDataURL(this.selectedFile);
//     }
//   }

//   getStatusClass(status: string) {
//     return {
//       'status status-active': status === 'active',
//       'status status-draft': status === 'draft',
//       'status status-archived': status === 'archived'
//     };
//   }

//   getStatusText(status: string) {
//     return {
//       'active': 'نشطة',
//       'draft': 'مسودة',
//       'archived': 'مؤرشفة',
//       'completed': 'مكتملة'
//     }[status];
//   }

//  getStatusValue(statusText: string): 'active' | 'draft' | 'archived' | 'completed' {
//     switch (statusText) {
//       case 'نشطة': return 'active';
//       case 'مسودة': return 'draft';
//       case 'مؤرشفة': return 'archived';
//       case 'مكتملة': return 'completed';
//       default: return 'draft';
//     }
//   }

//   scrollToForm() {
//     const formElement = document.getElementById('section1');
//     if (formElement) {
//       formElement.scrollIntoView({ behavior: 'smooth' });
//     }
//   }
// }
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

  categories = ['شاطئية', 'جبلية', 'ثقافية', 'مغامرات', 'تسوق'];
  statusOptions = ['نشطة', 'مكتملة', 'ملغية'];

  constructor(private tripService: TripService) {}

  ngOnInit() {
    // Use setTimeout to ensure DI is fully initialized
    setTimeout(() => {
      this.loadTrips();
    });
  }

  loadTrips() {
    this.tripService.getTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
      },
      error: (err) => {
        console.error('Error loading trips:', err);
        alert('حدث خطأ أثناء تحميل الرحلات');
      },
    });
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

  deleteTrip(tripId: string) {
    if (confirm('هل أنت متأكد من حذف هذه الرحلة؟')) {
      this.tripService
        .deleteTrip(tripId)
        .then(() => {
          this.trips = this.trips.filter((t) => t.id !== tripId);
        })
        .catch((error) => {
          console.error('Error deleting trip:', error);
          alert('حدث خطأ أثناء حذف الرحلة');
        });
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
}
