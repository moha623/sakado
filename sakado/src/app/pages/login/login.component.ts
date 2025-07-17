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
  // signupUsers: any[] = [];
  // loginObj: any = {
  //   username: '',
  //   password: '',
  // };

  // login() {
  //   console.log('Login object:', this.loginObj);
  //   if (!this.loginObj.username || !this.loginObj.password) {
  //     console.error('Both username and password are required');
  //     return;
  //   }
  //   this.authService.login(this.loginObj).subscribe(
  //     (response) => {
  //       console.log('Login successful', response);
  //       this.router.navigate(['/']);
  //     },
  //     (error) => {
  //       console.error('Login failed', error);
  //     }
  //   );
  // }
  // logout() {
  //   this.authService.logout();
  //   this.router.navigate(['/login']);
  // }
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/']);
      },

      error: (err) => console.error('Login failed', err),
    });
  }
logout() {
  this.auth.logout().subscribe({
    next: () => {
      console.log('User logged out');
      this.router.navigate(['/login']);
    },
    error: (e) => {
      console.error('Logout failed:', e);
      
      localStorage.removeItem('authToken');
      this.router.navigate(['/login']);
    }
  });
}

}
