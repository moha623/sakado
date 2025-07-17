export interface Trip {
  id?: string;
  name: string;
  category: string;
  destination: string;
  price: number;
  status: string;
  participants: number;
  maxParticipants: number;
  discountPrice?: number;
  description: string;
  itinerary: string;
  startDate: Date | string;
  endDate: Date | string;
}