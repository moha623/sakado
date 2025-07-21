import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public barChartData = {
    labels: ['تركيا', 'ماليزيا', 'المالديف', 'تايلاند', 'اليونان', 'دبي'],
    datasets: [{
      label: 'عدد الحجوزات',
      data: [325, 280, 210, 185, 120, 125],
      backgroundColor: [
        'rgba(52, 152, 219, 0.7)',
        'rgba(46, 204, 113, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(231, 76, 60, 0.7)',
        'rgba(155, 89, 182, 0.7)',
        'rgba(52, 73, 94, 0.7)'
      ],
      borderColor: [
        'rgb(52, 152, 219)',
        'rgb(46, 204, 113)',
        'rgb(241, 196, 15)',
        'rgb(231, 76, 60)',
        'rgb(155, 89, 182)',
        'rgb(52, 73, 94)'
      ],
      borderWidth: 1
    }]
  };

  public pieChartData = {
    labels: ['حجوزات عائلية', 'حجوزات فردية', 'حجوزات رومانسية', 'رحلات عمل', 'رحلات جماعية'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(52, 152, 219, 0.7)',
        'rgba(46, 204, 113, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(231, 76, 60, 0.7)',
        'rgba(155, 89, 182, 0.7)'
      ]
    }]
  };

  public lineChartData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'],
    datasets: [
      {
        label: '٢٠٢٢',
        data: [850, 920, 780, 1100, 1050, 1200, 980],
        borderColor: 'rgb(149, 165, 166)',
        backgroundColor: 'rgba(149, 165, 166, 0.1)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: '٢٠٢٣',
        data: [920, 980, 1050, 1150, 1250, 1350, 1245],
        borderColor: 'rgb(52, 152, 219)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Chart options
  public barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  public pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        rtl: true,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    }
  };

  public lineChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };
}
