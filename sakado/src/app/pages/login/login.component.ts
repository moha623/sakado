import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  signupUsers: any[] = [];
  loginObj: any = {
    email: '',
    password: '',
  };

  login() {
    console.log('Login object:', this.loginObj);
    if (!this.loginObj.email || !this.loginObj.password) {
      console.error('Both username and password are required');
      return;
    }
    this.authService.login(this.loginObj).subscribe(
      (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Login failed', error);
        // Display user-friendly error message
      }
    );
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


}
