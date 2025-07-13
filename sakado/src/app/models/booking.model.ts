// booking.model.ts
export interface Booking {
  id: string;
  trip: string;
  participant: string;
  date: string;
  amount: number;
  status: string; // 'confirmed', 'pending', 'cancelled'
}

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