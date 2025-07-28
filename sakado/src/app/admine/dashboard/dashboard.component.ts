import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Firestore, orderBy } from '@angular/fire/firestore';
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
} from 'ng-apexcharts';
import { format } from 'date-fns';
import { Trip } from '../../models/trip.model';

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
export class DashboardComponent implements OnInit, OnChanges {
  trips: Trip[] = []; // Now managed internally
  revenueChartOptions: any = null;
  isLoading = true;
  currentYear = new Date().getFullYear();

  bookingsChartOptions: any = {
    series: [],
    chart: {
      type: 'donut',
      height: 350,
      fontFamily: 'Tajawal, sans-serif',
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        colors: ['#fff'],
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#253808',
            },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#253808',
              formatter: (val: string) => `${val} حجوزات`,
            },
            total: {
              show: true,
              label: 'الإجمالي',
              color: '#253808',
              fontSize: '16px',
              fontWeight: 'bold',
              formatter: (w: any) => {
                return (
                  w.globals.seriesTotals.reduce(
                    (a: number, b: number) => a + b,
                    0
                  ) + ' حجز'
                );
              },
            },
          },
        },
      },
    },
    labels: [],
    colors: [
      '#253808',
      '#b5e249',
      '#8BC34A',
      '#4CAF50',
      '#CDDC39',
      '#FFEB3B',
      '#FFC107',
      '#FF9800',
      '#FF5722',
      '#795548',
      '#607D8B',
      '#9E9E9E',
    ],
    legend: {
      position: 'right',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      labels: {
        colors: '#253808',
        useSeriesColors: false,
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
  };

  registeredUsers: number = 0;
  activeTrips: number = 0;
  monthlyBookings: number = 0;
  participants: number = 0;
  revenue: number = 0;
  newUsers24h: number = 0;
  totaleMonthlyBookings: number = 0; // Total bookings for the month
  Totale: number = 0; // Total revenue for the month
  // Chart Options

  weeklyUsersChartOptions: BookingChartOptions;

  // Activity Feed
  activities: any[] = [];

  weeklyUsersChartOptopns: any;

  pieChartOptions: any = {};

  constructor(private firestore: Firestore) {
    this.weeklyUsersChartOptions = this.createChartOptions(
      'المستخدمون الجدد',
      'users'
    );
  }
  async ngOnInit() {
    this.isLoading = true;
    try {
      console.log('Initializing dashboard...');

      // Load all data in parallel for better performance
      await Promise.all([
        this.loadTrips(),
        this.loadWeeklyUsersChart(),
        this.loadBookingsData(),
        this.loadKPIData(), // Ensure this is called
      ]);
      console.log(this.Totale, 'Total Revenue for the month');

      this.updateRevenueChart();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
      console.log('Dashboard initialization completed');
    }
    
  }
  private async loadTrips(): Promise<void> {
    console.log('Fetching trips from Firestore...');
    const tripsRef = collection(this.firestore, 'trips');

    // Optional: Add filters if needed (e.g., only future trips)
    const q = query(
      tripsRef,
      orderBy('startDate', 'desc') // Example ordering
      // where('status', '==', 'active') // Example filter
    );

    const querySnapshot = await getDocs(q);
    this.trips = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Trip;
      return {
        ...data,
        id: doc.id,
        // Convert Firestore Timestamps to Date objects
        startDate:
          data.startDate instanceof Timestamp
            ? data.startDate.toDate()
            : data.startDate,
        endDate:
          data.endDate instanceof Timestamp
            ? data.endDate.toDate()
            : data.endDate,
      };
    });

    console.log(`Fetched ${this.trips.length} trips`);
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('Input changes detected:', changes);

    if (changes['trips'] && this.trips) {
      this.updateRevenueChart();
    }
  }

  private updateRevenueChart() {
    if (!this.trips || this.trips.length === 0) {
      this.revenueChartOptions = null;
      return;
    }

    const incomeData = this.calculateIncomeByCategory();

    // If no completed trips found
    if (incomeData.series.length === 0) {
      console.warn('No completed trips found for revenue chart');
      this.revenueChartOptions = null;
      return;
    }

    this.revenueChartOptions = {
      series: incomeData.series,
      chart: {
        type: 'pie',
        width: '100%',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'Cairo, sans-serif',
        events: {
          mounted: (chart: any) => {
            chart.windowResizeHandler();
          },
        },
      },
      labels: incomeData.labels,
      dataLabels: {
        enabled: true,
        formatter: (val: number, { seriesIndex, w }: any) => {
          const value = w.config.series[seriesIndex];
          return `$${value.toLocaleString('en-US', {
            maximumFractionDigits: 0,
          })}`;
        },
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
        },
        dropShadow: { enabled: false },
      },
      legend: {
        position: 'bottom',
        fontSize: '14px',
        labels: { colors: '#333' },
        itemMargin: { horizontal: 10, vertical: 5 },
      },
      tooltip: {
        y: {
          formatter: (val: number) =>
            `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: { show: true, fontSize: '16px' },
              value: {
                show: true,
                fontSize: '20px',
                formatter: (val: string) =>
                  `$${Number(val).toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                  })}`,
              },
              total: {
                show: true,
                label: 'إجمالي الإيرادات',
                formatter: () => {
                  const total = incomeData.series.reduce((a, b) => a + b, 0);
                  return `$${total.toLocaleString('en-US')}`;
                },
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom' },
          },
        },
      ],
    };
  }

  private calculateIncomeByCategory(): { series: number[]; labels: string[] } {
    const categoryMap = new Map<string, number>();

    if (!this.trips || this.trips.length === 0) {
      return { series: [], labels: [] };
    }

    let completedTripsCount = 0;
    let totalRevenue = 0;

    for (const trip of this.trips) {
      // Debug current trip

      completedTripsCount++;
      const price = trip.discountPrice ?? trip.price;
      const revenue = price * trip.participants;
      totalRevenue += revenue;

      const currentTotal = categoryMap.get(trip.category) || 0;
      const newTotal = currentTotal + revenue;
      categoryMap.set(trip.category, newTotal);
    }
    this.Totale = totalRevenue; // Store total revenue for the month
    console.log(this.Totale, 'Total Revenue for all trips');
    return {
      series: Array.from(categoryMap.values()),
      labels: Array.from(categoryMap.keys()),
    };
  }

  async loadBookingsData() {
    try {
      this.isLoading = true;
      const bookings = await this.getBookings();
      const monthlyCounts = this.aggregateBookingsByMonth(bookings);
      console.log(monthlyCounts, 'Monthly Bookings Counts');
      Object.keys(monthlyCounts).filter((value, month) => {
        console.log(value, month);
      });
      this.bookingsChartOptions.series = Object.values(monthlyCounts);
      this.bookingsChartOptions.labels = Object.keys(monthlyCounts);
    } catch (error) {
      console.error('Error loading bookings data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async getBookings(): Promise<any[]> {
    const bookingsRef = collection(this.firestore, 'bookings');

    // Get bookings for the current year
    const startDate = new Date(this.currentYear, 0, 1);
    const endDate = new Date(this.currentYear + 1, 0, 1);

    const q = query(
      bookingsRef,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<', Timestamp.fromDate(endDate))
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data());
  }

  aggregateBookingsByMonth(bookings: any[]): { [month: string]: number } {
    const monthNames = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];

    // Initialize counts for all months
    const monthlyCounts: { [key: string]: number } = {};
    monthNames.forEach((month) => (monthlyCounts[month] = 0));

    // Process each booking
    bookings.forEach((booking) => {
      if (booking.createdAt && booking.createdAt instanceof Timestamp) {
        const date = booking.createdAt.toDate();
        const monthIndex = date.getMonth();
        const monthName = monthNames[monthIndex];
        monthlyCounts[monthName]++;
      }
    });

    return monthlyCounts;
  }

  private async loadWeeklyUsersChart() {
    const weeklyUsers = await this.getWeeklyUsersData();

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
  private async getWeeklyUsersData(): Promise<
    { name: string; count: number }[]
  > {
    const days = [
      'الأحد',
      'الإثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت',
    ];
    const counts: number[] = new Array(7).fill(0);

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = today.getDay(); // 0 = Sunday
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);

      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(startDate);
        dayStart.setDate(startDate.getDate() + i);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        dayEnd.setHours(0, 0, 0, 0); // End of the day
        const startStr = format(dayStart, 'yyyy-MM-dd HH:mm:ss');
        const endStr = format(dayEnd, 'yyyy-MM-dd HH:mm:ss');

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
        count: counts[index],
      }));
    }
    return days.map((day, index) => ({
      name: day,
      count: counts[index],
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

  private async loadKPIData() {
    try {
      // 1. Registered Users
      const usersCol = collection(this.firestore, 'users');
      const usersSnapshot = await getCountFromServer(usersCol);
      this.registeredUsers = usersSnapshot.data().count;

      // 2. Active Trips
      const tripsQuery = query(
        collection(this.firestore, 'trips'),
        where('status', '==', 'active')
      );
      const tripsSnapshot = await getCountFromServer(tripsQuery);
      this.activeTrips = tripsSnapshot.data().count;

      // 3. Monthly Bookings (FIXED - using local timezone)
      const now = new Date();
      console.log('Current local time:', now.toString());

      // Create dates in local timezone
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      console.log('Local start of month:', startOfMonth.toString());
      console.log('Local end of month:', endOfMonth.toString());

      // Convert to Firestore Timestamps
      const startTimestamp = Timestamp.fromDate(startOfMonth);
      const endTimestamp = Timestamp.fromDate(endOfMonth);

      console.log(
        'Firestore start timestamp:',
        startTimestamp.toDate().toString()
      );
      console.log('Firestore end timestamp:', endTimestamp.toDate().toString());

      const bookingsQuery = query(
        collection(this.firestore, 'bookings'),
        where('bookingDate', '>=', startTimestamp),
        where('bookingDate', '<=', endTimestamp)
      );

      // Get actual documents for debugging
      const bookingsSnapshot = await getDocs(bookingsQuery);

      // Debug: Check if documents exist
      if (bookingsSnapshot.empty) {
        console.warn('No bookings found for current month!');
      } else {
        console.log(
          `Found ${bookingsSnapshot.size} bookings for current month`
        );
        bookingsSnapshot.forEach((doc) => {
          const data = doc.data();
          const bookingDate = data['bookingDate'];
          console.log(
            `Booking ID: ${doc.id}, ` +
              `Date: ${bookingDate.toDate().toString()}, ` +
              `Timestamp: ${bookingDate.seconds}.${bookingDate.nanoseconds}`
          );
        });
      }

      this.monthlyBookings = bookingsSnapshot.size;

      // 5. New Users (24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const newUsersQuery = query(
        collection(this.firestore, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(twentyFourHoursAgo))
      );

      const newUsersSnapshot = await getCountFromServer(newUsersQuery);
      this.newUsers24h = newUsersSnapshot.data().count;

      // DEBUG: Log date ranges and counts
      console.log('Start of month:', startOfMonth);
      console.log('End of month:', endOfMonth);
      console.log('Monthly bookings:', this.monthlyBookings);
      console.log('First booking doc:', bookingsSnapshot.docs[1]?.data());
    } catch (error) {
      console.error('Error loading KPI data:', error);
    }
  }
}
