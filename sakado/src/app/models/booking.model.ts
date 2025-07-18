// booking.model.ts
export interface Booking {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  travelDate: string; // or Date if you prefer
  destination: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  trip: string;
  participant: string;
}
// export interface Booking {
  
//   trip: string;
//   participant: string;
//   date: string;
//   amount: number;
//   status: string; // 'confirmed', 'pending', 'cancelled'
// }

export interface BookingDetails {
  tripName: string;
  tripDate: string;
  bookingDate: string;
  lastUpdate: string;
  totalAmount: number;
  paymentStatus: string;
  participantInfo: {
    fullName: string;
    email: string;
    phone: string;
    idNumber: string;
    emergencyContact: string;
    emergencyPhone: string;
    medicalNotes: string;
  };
  participants: {
    name: string;
    email: string;
    phone: string;
    status: string;
  }[];
}