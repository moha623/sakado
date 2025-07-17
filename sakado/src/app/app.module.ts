import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
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
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
 
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
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
import { TripService } from './services/trip.service';
import { FirebaseModule } from './firebase/firebase.module';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { getAuth } from 'firebase/auth';

 
import {   initializeApp } from '@angular/fire/app';
import { TokenInterceptor } from './interceptors/jwt.interceptor';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
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
  ],
  imports: [
    FirebaseModule, // Import FirebaseModule to initialize Firebase
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    FilterBookingsPipe,
 
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    BookingService,
    TripService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
