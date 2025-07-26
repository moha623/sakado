import { Component, OnInit } from '@angular/core';
 
import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  Timestamp,
} from 'firebase/firestore';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexLegend,
  ApexResponsive,
  ApexNonAxisChartSeries,
  ApexTheme,
  ApexTooltip,
} from 'ng-apexcharts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  responsive: ApexResponsive[];
  theme: ApexTheme;
  tooltip: ApexTooltip;
};
type BookingChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  responsive: ApexResponsive[];
  legend: ApexLegend;
  fill: ApexFill;
};

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  isLoading = true;

  revenuePieChartOptions: PieChartOptions;
  registeredUsers: number = 0;
  activeTrips: number = 0;
  monthlyBookings: number = 0;
  participants: number = 0;
  revenue: number = 0;
  newUsers24h: number = 0;

  // Chart Options
  bookingsChartOptions: BookingChartOptions;
  popularityChartOptions: BookingChartOptions;
  weeklyUsersChartOptions: BookingChartOptions;

  // Activity Feed
  activities: any[] = [];

  weeklyUsersChartOptopns: any;

  // Table Data
  tripsData = [
    { name: 'رحلة الصحراء', bookings: 98, participants: 42, revenue: 4200 },
    { name: 'رحلة الجبال', bookings: 76, participants: 35, revenue: 3500 },
    { name: 'رحلة الغابات', bookings: 65, participants: 28, revenue: 2800 },
    { name: 'رحلة الساحل', bookings: 58, participants: 24, revenue: 2400 },
    { name: 'رحلة المغامرة', bookings: 42, participants: 18, revenue: 1800 },
  ];

  constructor(private firestore: Firestore) {
    this.revenuePieChartOptions = this.createPieChartOptions();
    this.bookingsChartOptions = this.createChartOptions(
      'حجوزات الرحلات',
      'bookings'
    );
    this.popularityChartOptions = this.createChartOptions(
      'شعبية الرحلات',
      'participants'
    );
    this.weeklyUsersChartOptions = this.createChartOptions(
      'المستخدمون الجدد',
      'users'
    );
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      await this.loadWeeklyUsersChart();
     
      await this.loadKPIData();
      await this.loadChartsData();
      this.loadActivityFeed();
      this.updatePieChartData(); // Add this line
       
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }

    
  }

  private async loadWeeklyUsersChart() {
    const weeklyUsers = await this.getWeeklyUsersData();
    console.log('weeklyUsers', weeklyUsers);
    this.weeklyUsersChartOptions = {
      series: [
        {
          name: 'المستخدمون الجدد',
          data: weeklyUsers.map((day) => day.count),
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        fontFamily: 'Cairo, sans-serif',
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '70%',
          borderRadius: 3,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        style: {
          colors: ['#000'],
          fontSize: '12px',
          fontWeight: 400,
        },
        offsetX: 10,
      },
      xaxis: {
        categories: weeklyUsers.map((day) => day.name),
        position: 'top',
        labels: {
          show: true,
          style: {
            fontSize: '12px',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        crosshairs: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          show: true,
          align: 'right',
          minWidth: 100,
          maxWidth: 100,
          style: {
            fontSize: '12px',
          },
        },
        reversed: true,
      },
      grid: {
        show: true,
        borderColor: '#e0e0e0',
        strokeDashArray: 3,
        position: 'back',
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      fill: {
        opacity: 1,
        type: 'solid',
        colors: ['#8B5CF6'],
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontFamily: 'Cairo, sans-serif',
        itemMargin: {
          horizontal: 10,
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 250 },
          },
        },
      ],
    };
  }
 private async getWeeklyUsersData(): Promise<{ name: string; count: number }[]> {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const counts: number[] = new Array(7).fill(0);
    
    try {
      // Get start of week (Sunday)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = today.getDay(); // 0 = Sunday
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);
      
      // Query for each day of the week
      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(startDate);
        dayStart.setDate(startDate.getDate() + i);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);
        
        // Format dates for debugging
        const startStr = format(dayStart, 'yyyy-MM-dd HH:mm:ss',  );
        const endStr = format(dayEnd, 'yyyy-MM-dd HH:mm:ss',);
      
        
        const q = query(
          collection(this.firestore, 'users'),
          where('createdAt', '>=', Timestamp.fromDate(dayStart)),
          where('createdAt', '<', Timestamp.fromDate(dayEnd))
        );
        
        const snapshot = await getCountFromServer(q);
        counts[i] = snapshot.data().count;
      
      }
    } catch (error) {
      console.error('Error fetching weekly users:', error);
      // Fallback to test data for debugging
      return days.map((day, index) => ({
        name: day,
        count: [15, 22, 18, 30, 25, 40, 35][index]
      }));
    }
    
    return days.map((day, index) => ({
      name: day,
      count: counts[index]
    }));
  }
  private createChartOptions(
    title: string,
    metric: string
  ): BookingChartOptions {
    return {
      series: [{ name: title, data: [] }],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'Cairo, sans-serif',
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '70%',
          borderRadius: 3,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        style: {
          colors: ['#000'],
          fontSize: '12px',
          fontWeight: 400,
        },
        formatter: (val: number) => {
          if (metric === 'revenue') return `$${val.toLocaleString()}`;
          return val.toString();
        },
        offsetX: 10,
      },
      xaxis: {
        categories: [],
        position: 'top',
        labels: {
          show: true,
          style: {
            fontSize: '12px',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        crosshairs: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          show: true,
          align: 'right',
          minWidth: 100,
          maxWidth: 100,
          style: {
            fontSize: '12px',
          },
        },
        reversed: true,
      },
      grid: {
        show: true,
        borderColor: '#e0e0e0',
        strokeDashArray: 3,
        position: 'back',
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 250 },
          },
        },
      ],
      fill: {
        opacity: 1,
        type: 'solid',
        colors:
          metric === 'bookings'
            ? ['#1b4332']
            : metric === 'participants'
            ? ['#1b4332']
            : ['#1b4332'],
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontFamily: 'Cairo, sans-serif',
        itemMargin: {
          horizontal: 10,
        },
      },
    };
  }

  private updatePieChartData(): void {
    const totalRevenue = this.tripsData.reduce(
      (sum, trip) => sum + trip.revenue,
      0
    );
    const percentages = this.tripsData.map((trip) =>
      Math.round((trip.revenue / totalRevenue) * 100)
    );

    this.revenuePieChartOptions = {
      ...this.revenuePieChartOptions,
      series: percentages,
      labels: this.tripsData.map((trip) => trip.name),
    };
  }
  private async loadKPIData() {
    // Get registered users count
    const usersCol = collection(this.firestore, 'users');
    const usersSnapshot = await getCountFromServer(usersCol);
    this.registeredUsers = usersSnapshot.data().count;

    // Get active trips
    const tripsQuery = query(
      collection(this.firestore, 'trips'),
      where('status', '==', 'active')
    );
    const tripsSnapshot = await getCountFromServer(tripsQuery);
    this.activeTrips = tripsSnapshot.data().count;

    // Get monthly bookings
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    );

    const bookingsQuery = query(
      collection(this.firestore, 'bookings'),
      where('bookingDate', '>=', startOfMonth),
      where('bookingDate', '<=', endOfMonth)
    );

    const bookingsSnapshot = await getCountFromServer(bookingsQuery);
    this.monthlyBookings = bookingsSnapshot.data().count;

    // Get participants (sum of participants in all bookings)
    const bookingsDocs = await getDocs(bookingsQuery);
    this.participants = bookingsDocs.docs.reduce(
      (sum, doc) => sum + (doc.data()['participants'] || 1),
      0
    );

    // Get revenue
    this.revenue = bookingsDocs.docs.reduce(
      (sum, doc) => sum + (doc.data()['totalPrice'] || 0),
      0
    );

    // Get new users in last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const newUsersQuery = query(
      collection(this.firestore, 'users'),
      where('createdAt', '>=', yesterday)
    );

    const newUsersSnapshot = await getCountFromServer(newUsersQuery);
    this.newUsers24h = newUsersSnapshot.data().count;
  }

  private async loadChartsData() {
    // Bookings by Trip
    const trips = await this.getTripsData();
    this.bookingsChartOptions = {
      ...this.bookingsChartOptions,
      series: [
        {
          name: 'عدد الحجوزات',
          data: trips.map((trip) => trip.bookings),
        },
      ],
      xaxis: {
        ...this.bookingsChartOptions.xaxis,
        categories: trips.map((trip) => trip.name),
      },
    };

    // Popularity by Participants
    this.popularityChartOptions = {
      ...this.popularityChartOptions,
      series: [
        {
          name: 'عدد المشاركين',
          data: trips.map((trip) => trip.participants),
        },
      ],
      xaxis: {
        ...this.popularityChartOptions.xaxis,
        categories: trips.map((trip) => trip.name),
      },
    };

    // Weekly New Users
    const weeklyUsers = await this.getWeeklyUsersData();
    this.weeklyUsersChartOptions = {
      ...this.weeklyUsersChartOptions,
      series: [
        {
          name: 'المستخدمون الجدد',
          data: weeklyUsers.map((day) => day.count),
        },
      ],
      xaxis: {
        ...this.weeklyUsersChartOptions.xaxis,
        categories: weeklyUsers.map((day) => day.name),
      },
    };
  }

  private async getTripsData(): Promise<
    { name: string; bookings: number; participants: number }[]
  > {
    // In a real app, fetch from Firestore
    return [
      { name: 'رحلة الصحراء', bookings: 98, participants: 42 },
      { name: 'رحلة الجبال', bookings: 76, participants: 35 },
      { name: 'رحلة الغابات', bookings: 65, participants: 28 },
      { name: 'رحلة الساحل', bookings: 58, participants: 24 },
      { name: 'رحلة المغامرة', bookings: 42, participants: 18 },
    ];
  }

  private loadActivityFeed() {
    // Replace with actual Firestore query
    this.activities = [
      {
        type: 'booking',
        title: 'حجز جديد',
        description: 'قام أحمد محمد بحجز رحلة استكشاف الصحراء',
        time: 'منذ 5 دقائق',
      },
      {
        type: 'user',
        title: 'مستخدم جديد',
        description: 'لين عبد الله قامت بالتسجيل في الموقع',
        time: 'منذ 30 دقيقة',
      },
      {
        type: 'review',
        title: 'تقييم جديد',
        description: 'عمر خالد أعطى 5 نجوم لرحلة الجبال',
        time: 'منذ ساعة',
      },
      {
        type: 'update',
        title: 'تحديث رحلة',
        description: 'تم تحديث رحلة استكشاف الجبال',
        time: 'منذ ساعتين',
      },
    ];
  }

  // Get icon for activity type
  getActivityIcon(type: string): string {
    switch (type) {
      case 'booking':
        return 'fas fa-calendar-check';
      case 'user':
        return 'fas fa-user-plus';
      case 'review':
        return 'fas fa-star';
      case 'update':
        return 'fas fa-edit';
      case 'inquiry':
        return 'fas fa-comment';
      default:
        return 'fas fa-bell';
    }
  }

  private createPieChartOptions(): PieChartOptions {
    return {
      series: [],
      chart: {
        type: 'pie',
        height: 350,
        width: '100%',
        toolbar: { show: false },
        fontFamily: 'Cairo, sans-serif',
      },
      labels: [],
      colors: [
        '#3B82F6',
        '#10B981',
        '#8B5CF6',
        '#F59E0B',
        '#EF4444',
        '#6366F1',
      ],
      dataLabels: {
        enabled: true,
        formatter: (val: number, opts) => {
          return `${Math.round(val)}%`;
        },
        style: {
          fontSize: '14px',
          fontFamily: 'Cairo, sans-serif',
          fontWeight: 'bold',
        },
        dropShadow: {
          enabled: false,
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontFamily: 'Cairo, sans-serif',
        fontSize: '14px',

        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
        formatter: (seriesName, opts) => {
          return `${seriesName}: $${this.tripsData[
            opts.seriesIndex
          ].revenue.toLocaleString()}`;
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 300,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      theme: {
        mode: 'light',
      },
      tooltip: {
        fillSeriesColor: false,
        y: {
          formatter: (val, opts) => {
            return `$${this.tripsData[
              opts.seriesIndex
            ].revenue.toLocaleString()} (${Math.round(val)}%)`;
          },
        },
      },
    };
  }
}
