// booking-filter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Booking } from '../models/booking.model';

@Pipe({
  name: 'filterBookings'
})
export class FilterBookingsPipe implements PipeTransform {
  transform(bookings: Booking[], statusFilter: string, tripFilter: string): Booking[] {
    return bookings.filter(booking => {
      const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
      const tripMatch = tripFilter === 'all' || booking.id === tripFilter;
      return statusMatch && tripMatch;
    });
  }
}