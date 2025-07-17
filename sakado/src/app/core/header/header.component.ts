import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})


export class HeaderComponent implements OnInit, OnDestroy {

  mobileMenuOpen: boolean = false;
   isLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {

    //   this.authService.loggedIn$.subscribe(status => {
    //           console.log(status)
    //   this.isLoggedIn = status;
    //   console.log(status)
    // });
  }

  
  onLogout() {
    this.authService.logout();
      this.router.navigate(['/auth/login']);
  }
  ngOnDestroy() {

  }
}

