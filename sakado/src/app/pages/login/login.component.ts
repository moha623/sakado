import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading = false;
  success = false;
  errorData: {message: string, icon: string, links?: any[]} | null = null;
  redirectTimer: any;
  countdown = 5;

  constructor(private auth: AuthService, public router: Router) {}

  onSubmit() {
    this.errorData = null;
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (user) => {
          if (user.role === 'admin') {
        this.router.navigate(['/admine/dashboard']);
                console.log('Login successful', user);
        this.success = true;
        this.loading = false;
        console.log(user.role)
        // Start redirect countdown
        this.startCountdown();
      }else {
        this.router.navigate(['/']);
      }

      },
      error: (err) => {
        this.setErrorData(err.code || 'unknown');
        this.loading = false;
        console.error('Login failed', err);
      },
    });
  }

  startCountdown() {
    this.countdown = 5;
    this.redirectTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.redirectTimer);
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  private setErrorData(errorCode: string) {
    const errorMap: Record<string, 
      {message: string, icon: string, links?: Array<{text: string, path?: string, action?: string}>}
    > = {
      'auth/invalid-credential': {
        message: 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.',
        icon: 'fa-exclamation-triangle'
      },
      'auth/user-disabled': {
        message: 'هذا الحساب معطل. يرجى الاتصال بالدعم الفني.',
        icon: 'fa-user-lock',
        links: [
          {text: 'الاتصال بالدعم', action: 'mailto:support@example.com'}
        ]
      },
      'auth/user-not-found': {
        message: 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني.',
        icon: 'fa-user-times',
        links: [
          {text: 'إنشاء حساب جديد', path: '/auth/register'},
          {text: 'استعادة كلمة المرور', path: '/reset-password'}
        ]
      },
      'auth/wrong-password': {
        message: 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
        icon: 'fa-key'
      },
      'auth/too-many-requests': {
        message: 'عدد كبير جدًا من محاولات الدخول الفاشلة. يرجى المحاولة لاحقًا.',
        icon: 'fa-shield-alt'
      },
      'auth/network-request-failed': {
        message: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
        icon: 'fa-wifi'
      },
      'default': {
        message: 'حدث خطأ غير متوقع أثناء محاولة الدخول. يرجى المحاولة مرة أخرى.',
        icon: 'fa-exclamation-circle'
      }
    };

    this.errorData = errorMap[errorCode] || errorMap['default'];
  }

  // Clean up timer when component is destroyed
  ngOnDestroy() {
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
    }
  }
}