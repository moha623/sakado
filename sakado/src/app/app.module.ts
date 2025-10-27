import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './core/layout/layout.component';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AboutComponent } from './core/about/about.component';
import { ContactComponent } from './core/contact/contact.component';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

import { AuthService } from './services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingComponent } from './core/booking/booking.component';
import { MoreDetailsComponent } from './pages/more-details/more-details.component';
import { GalleryComponent } from './core/gallery/gallery.component';
import { AdmineComponent } from './admine/admine.component';
import { PackageManagementComponent } from './admine/package-management/package-management.component';
import { BookingManagementComponent } from './admine/booking-management/booking-management.component';
import { DashboardComponent } from './admine/dashboard/dashboard.component';
import { FilterBookingsPipe } from './pipes/filter-bookings.pipe';
import { BookingService } from './services/booking.service';

import { ShortenIdPipe } from './pipes/shorten-id-.pipe';
import { SimpleDatePipe } from './pipes/shortdate.pipe';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ModelPopUpComponent } from './model-pop-up/model-pop-up.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { UsersManagementComponent } from './admine/users-management/users-management.component';

// Import AngularFire modules (new modular approach)
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    LayoutComponent,
    AboutComponent,
    ContactComponent,
    BookingComponent,
    MoreDetailsComponent,
    GalleryComponent,
    AdmineComponent,
    PackageManagementComponent,
    BookingManagementComponent,
    DashboardComponent,
    ModelPopUpComponent,
    UsersManagementComponent,
    AccessDeniedComponent,
    // FilterBookingsPipe,
    // ShortenIdPipe,
    // SimpleDatePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    NgApexchartsModule,
    SimpleDatePipe,
    ShortenIdPipe
  ],
  providers: [
    // Initialize Firebase with the new modular approach
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    
    AuthService,
    BookingService,
    DatePipe,
 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}