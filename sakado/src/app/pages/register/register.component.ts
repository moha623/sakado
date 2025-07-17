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
  // form: any = {
  //   username: null,
  //   lastname:null,
  //   email: null,
  //   password: null,
  //   number:null,
  //   confirmpassword:null,
  // };
  // isSuccessful = false;
  // isSignUpFailed = false;
  // errorMessage = '';

  //   constructor(private authService: AuthService) {}

  // onSubmit(): void {
  //   const { username, lastname, email, password, number, confirmpassword } = this.form;
  //   console.log('Form inputs:', { username, lastname, email, password, number, confirmpassword });
  //   this.authService.register(username, email, password, lastname, number, confirmpassword).subscribe({
  //     next: data => {
  //       this.isSuccessful = true;
  //       this.isSignUpFailed = false;
  //       console.log(this.form);
  //       alert('Registration successful! Please log in.');
  //     },
  //     error: err => {
  //       this.errorMessage = err.error.message;
  //       this.isSignUpFailed = true;
  //     }
  //   });
  // }

  constructor(private authService: AuthService, private router: Router) {}

  email: string = '';
  password: string = '';
  error: string = '';
  username: string = '';
  lastname: string = '';
  number: number = 0;

  async onSubmit() {
    this.error = '';
    try {
      await this.authService.register(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch(error:any) {
      this.error = this.getErrorMessage(error.code);
    }
  }
    private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email already exists';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      default:
        return 'Registration failed';
    }
  }
}
