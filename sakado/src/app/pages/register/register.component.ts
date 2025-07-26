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

  constructor(private authService: AuthService, private router: Router) {}

  email: string = '';
  password: string = '';
  error: string = '';
  username: string = '';
  lastname: string = '';
  number: any;

   onSubmit() {
    this.error = '';
    
    // PREPARE USER DATA
    const userData = {
      username: this.username,
      lastname: this.lastname,
      number: this.number
    };

    this.authService.register(this.email, this.password, userData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        alert('Registration successful! Please log in.');
      },
      error: (error) => { // HANDLE ERRORS
        this.error = this.getErrorMessage(error.code || 'unknown');
        console.error('Registration failed:', error);
      }
    });
  }
  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email already exists';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
        case 'unknown':
      return 'Failed to save user profile';
      default:
        return 'Registration failed';
    }
  }
}
