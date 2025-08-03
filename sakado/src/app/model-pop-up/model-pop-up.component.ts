import { Component, Output, EventEmitter } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Trip } from '../models/trip.model';
import {   Input } from '@angular/core';
import {  doc, updateDoc } from '@angular/fire/firestore';
 
@Component({
    standalone: false,
  selector: 'app-model-pop-up',

  templateUrl: './model-pop-up.component.html',
styleUrls: ['./model-pop-up.component.scss'],
})
export class ModelPopUpComponent {
   // Options
  categories = ['شاطئية', 'جبلية', 'ثقافية', 'مغامرات', 'تسوق'];
  statusOptions = ['نشطة', 'مكتملة', 'ملغية'];

  // Status mapping
  statusMap: { [key: string]: string } = {
    'نشطة': 'active',
    'مكتملة': 'completed',
    'ملغية': 'cancelled'
  };

  isOpen = false;

  trip: Trip = {
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

  @Input() currentTrip: Trip | null = null;
  @Output() tripAdded = new EventEmitter<void>();

  constructor(private firestore: Firestore) {}

  open(trip?: Trip) {
    if (trip) {
      this.currentTrip = trip;
      this.trip = { ...trip };
    } else {
      this.resetForm();
    }
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this.resetForm();
  }

  async saveTrip() {
    try {
      const tripsCollection = collection(this.firestore, 'trips');
      
      if (this.currentTrip && this.currentTrip.id) {
        // Update existing trip
        const tripRef = doc(this.firestore, `trips/${this.currentTrip.id}`);
        await updateDoc(tripRef, {
          ...this.trip,
          startDate: new Date(this.trip.startDate),
          endDate: new Date(this.trip.endDate)
        });
      } else {
        // Create new trip
        await addDoc(tripsCollection, {
          ...this.trip,
          startDate: new Date(this.trip.startDate),
          endDate: new Date(this.trip.endDate),
          createdAt: new Date()
        });
      }
      
      this.tripAdded.emit();
      this.close();
    } catch (error) {
      console.error('Error saving trip: ', error);
      alert('حدث خطأ أثناء حفظ الرحلة!');
    }
  }

  resetForm() {
    this.trip = {
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
    this.currentTrip = null;
  }
}
