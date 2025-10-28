import { Component } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl:'./home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
   showSuccess = false;
    showError = false;
    isSubmitting = false;
    messageData = {
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    };
    constructor(private coreService: CoreService) {}
  
    validateEmail(email: string) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  
    validatePhone(phone: string) {
      const re = /^[0-9]{8,8}$/; // Allow 10-15 digits
      return re.test(phone);
    }
    async onAddFedback() {
      this.isSubmitting = true;
      try {
        this.showSuccess = true;
        setTimeout(() => (this.showSuccess = false), 5000);
        // Validation
        if (
          !this.messageData.fullName ||
          !this.messageData.email ||
          !this.messageData.message
        ) {
          alert('يرجى ملء الحقول المطلوبة');
          return;
        }
  
        if (!this.validateEmail(this.messageData.email)) {
          alert('البريد الإلكتروني غير صالح');
          return;
        }
  
        // if (
        //   this.messageData.phone &&
        //   !this.validatePhone(this.messageData.phone)
        // ) {
        //   alert('رقم الجوال غير صالح');
        //   return;
        // }
  
        // Send message
        await this.coreService.addFeedback(this.messageData);
  
        // Success
        alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
        this.resetForm();
      } catch (error) {
        console.error('Message error:', error);
        this.showError = true;
        setTimeout(() => (this.showError = false), 5000);
        alert('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      } finally {
        this.isSubmitting = false;
      }
    }
  
    resetForm() {
      this.messageData = {
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      };
   }
}
