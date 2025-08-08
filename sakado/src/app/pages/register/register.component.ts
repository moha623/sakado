import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  loading = false;
  success = false; // Add success state
  errorData: {message: string, icon: string, links?: Array<{text: string, path?: string, action?: string}>} | null = null;
  constructor(private authService: AuthService, public router: Router) {}

  email: string = '';
  password: string = '';
  username: string = '';
  lastname: string = '';
  number: any;
   role: 'user' | 'admin' = 'user'; // Add role property with default value

  onSubmit() {
    this.errorData = null;
    this.loading = true;

    const userData = {
      username: this.username,
      lastname: this.lastname,
      number: this.number,
      role:this.role
    };

    this.authService.register(this.email, this.password, userData).subscribe({
      next: () => {
        this.success = true; // Show success state
        this.loading = false;
        
      
        setTimeout(() => {
          this.router.navigate(['auth/login']);
        }, 5000);
      },
      error: (error) => {
        this.setErrorData(error.code || 'unknown');
        this.loading = false;
        console.error('Registration failed:', error);
      },
    });
  }

  private setErrorData(errorCode: string) {
    const errorMap: Record<string, 
      {message: string, icon: string, links?: Array<{text: string, path?: string, action?: string}>}
    > = {
      'auth/email-already-in-use': {
        message: 'هذا البريد الإلكتروني مسجل بالفعل.',
        icon: 'fa-envelope',
        links: [
          {text: 'تسجيل الدخول', path: '/login'},
          {text: 'إعادة تعيين كلمة المرور', path: '/reset-password'}
        ]
      },
      'auth/invalid-email': {
        message: 'صيغة البريد الإلكتروني غير صحيحة. يرجى إدخال بريد صالح مثل: example@domain.com',
        icon: 'fa-exclamation-circle'
      },
      'auth/weak-password': {
        message: 'كلمة المرور ضعيفة. يجب أن تحتوي على الأقل على 6 أحرف مع مزج بين الحروف والأرقام والرموز',
        icon: 'fa-shield-alt'
      },
      'auth/network-request-failed': {
        message: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى',
        icon: 'fa-wifi'
      },
      'unknown': {
        message: 'حدث خطأ غير متوقع أثناء حفظ الملف الشخصي.',
        icon: 'fa-exclamation-triangle',
        links: [
          {text: 'الاتصال بالدعم', action: 'mailto:support@example.com'}
        ]
      },
      'default': {
        message: 'تعذر إتمام التسجيل. يرجى التحقق من البيانات والمحاولة مرة أخرى',
        icon: 'fa-times-circle'
      }
    };

    this.errorData = errorMap[errorCode] || errorMap['default'];
  }
}