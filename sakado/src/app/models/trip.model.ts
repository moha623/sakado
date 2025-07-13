// trip.model.ts
export interface Trip {
  id: number;
  name: string;
  category: string;
  destination: string;
  price: number;
  status: 'active' | 'draft' | 'archived' | 'completed';
  participants: string; // e.g. "24/30"
  startDate?: Date;
  endDate?: Date;
  maxParticipants?: number;
  description?: string;
  itinerary?: string;
  discountPrice?: number;
  image?: string;
}