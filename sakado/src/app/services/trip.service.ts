// trip.service.ts
import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private trips: Trip[] = [
    {
      id: 1,
      name: 'استكشاف الصحراء المخفية',
      category: 'صحراوي',
      destination: 'الربع الخالي',
      price: 299,
      status: 'active',
      participants: '24/30',
      startDate: new Date('2023-11-20'),
      endDate: new Date('2023-11-25'),
      maxParticipants: 30,
      description: 'رحلة استكشافية في عمق صحراء الربع الخالي، تجربة فريدة مع مرشدين محترفين',
      itinerary: 'اليوم 1: الوصول والمخيم الأول\nاليوم 2: رحلة الجمال\nاليوم 3: زيارة الواحات\nاليوم 4: التزلج على الرمال\nاليوم 5: العودة',
      discountPrice: 279
    },
    {
      id: 2,
      name: 'مغامرة الغابات الاستوائية',
      category: 'غابات',
      destination: 'أمازون',
      price: 499,
      status: 'active',
      participants: '18/20',
      startDate: new Date('2023-12-10'),
      endDate: new Date('2023-12-20'),
      maxParticipants: 20,
      description: 'مغامرة في قلب غابات الأمازون المطيرة لاكتشاف الحياة البرية والنباتات النادرة',
      itinerary: 'اليوم 1-2: السفر والتوجه\nاليوم 3-5: استكشاف الغابات\nاليوم 6-7: رحلات بالقوارب\nاليوم 8-10: زيارة القبائل والعودة'
    },
    {
      id: 3,
      name: 'اكتشاف الجبال المفقودة',
      category: 'جبال',
      destination: 'جبال الأنديز',
      price: 399,
      status: 'draft',
      participants: '0/15',
      maxParticipants: 15,
      description: 'تسلق جبال الأنديز الشامخة واكتشاف المناظر الطبيعية الخلابة',
      itinerary: 'اليوم 1: الوصول إلى قاعدة الجبل\nاليوم 2-4: التسلق\nاليوم 5: القمة والنزول\nاليوم 6: العودة'
    },
    {
      id: 4,
      name: 'رحلة السواحل المخفية',
      category: 'ساحلي',
      destination: 'جزر المالديف',
      price: 599,
      status: 'archived',
      participants: '0/12',
      maxParticipants: 12,
      description: 'استكشاف الجزر والشواطئ المخفية في أرخبيل المالديف',
      itinerary: 'اليوم 1-3: جزيرة ماليه\nاليوم 4-6: الغوص والجزر المرجانية\nاليوم 7-9: الجزر المحلية والعودة'
    }
  ];

  getTrips() {
    return this.trips;
  }

  addTrip(newTrip: Trip) {
    newTrip.id = this.trips.length + 1;
    this.trips.unshift(newTrip);
    return this.trips;
  }

  getCategories() {
    return ['صحراوي', 'جبال', 'غابات', 'ساحلي', 'حضري'];
  }

  getStatusOptions() {
    return ['مسودة', 'نشطة', 'مؤرشفة', 'مكتملة'];
  }
}