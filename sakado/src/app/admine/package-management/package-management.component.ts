import { Component, OnInit } from '@angular/core';
import { Trip } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-package-management',
  standalone: false,
  templateUrl: './package-management.component.html',
  styleUrl: './package-management.component.scss'
})
export class PackageManagementComponent implements OnInit {
  trips: Trip[] = [];
  categories: string[] = [];
  statusOptions: string[] = [];
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  newTrip: Trip = {
    id: 0,
    name: '',
    category: '',
    destination: '',
    price: 0,
    status: 'draft',
    participants: '0/0',
    maxParticipants: 20
  };

  constructor(private tripService: TripService) {}

  ngOnInit() {
    this.trips = this.tripService.getTrips();
    this.categories = this.tripService.getCategories();
    this.statusOptions = this.tripService.getStatusOptions();
  }


  addNewTrip() {
    if (this.newTrip.name && this.newTrip.category && this.newTrip.destination) {
      // Add image if selected
      if (this.selectedFile) {
        this.newTrip.image = URL.createObjectURL(this.selectedFile);
      }
      
      this.newTrip.participants = `0/${this.newTrip.maxParticipants}`;
      this.tripService.addTrip(this.newTrip);
      this.trips = this.tripService.getTrips();
      
      // Reset form
      this.newTrip = {
        id: 0,
        name: '',
        category: '',
        destination: '',
        price: 0,
        status: 'draft',
        participants: '0/0',
        maxParticipants: 20
      };
      
      // Clear file selection
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  getStatusClass(status: string) {
    return {
      'status status-active': status === 'active',
      'status status-draft': status === 'draft',
      'status status-archived': status === 'archived'
    };
  }

  getStatusText(status: string) {
    return {
      'active': 'نشطة',
      'draft': 'مسودة',
      'archived': 'مؤرشفة',
      'completed': 'مكتملة'
    }[status];
  }

 getStatusValue(statusText: string): 'active' | 'draft' | 'archived' | 'completed' {
    switch (statusText) {
      case 'نشطة': return 'active';
      case 'مسودة': return 'draft';
      case 'مؤرشفة': return 'archived';
      case 'مكتملة': return 'completed';
      default: return 'draft';
    }
  }

  scrollToForm() {
    const formElement = document.getElementById('section1');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
