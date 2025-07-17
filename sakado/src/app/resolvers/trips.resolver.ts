import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { TripService } from '../services/trip.service';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip.model';

@Injectable({ providedIn: 'root' })
export class TripsResolver implements Resolve<Trip[]> {
  constructor(private tripService: TripService) {}

  resolve(): Observable<Trip[]> {
    return this.tripService.getTrips();
  }
}