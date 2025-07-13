import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: any = {
    username: null,
    lastname:null,
    email: null,
    password: null,
    number:null,
    confirmpassword:null,
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';


    constructor(private authService: AuthService) {}

  onSubmit(): void {
    const { username, lastname, email, password, number, confirmpassword } = this.form;
    console.log('Form inputs:', { username, lastname, email, password, number, confirmpassword });
    this.authService.register(username, email, password, lastname, number, confirmpassword).subscribe({
      next: data => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        console.log(this.form);
        alert('Registration successful! Please log in.');
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }
}
