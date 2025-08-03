import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './core/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AboutComponent } from './core/about/about.component';
import { ContactComponent } from './core/contact/contact.component';
 
import { BookingComponent } from './core/booking/booking.component';
import { MoreDetailsComponent } from './pages/more-details/more-details.component';
import { GalleryComponent } from './core/gallery/gallery.component';
import { AdmineComponent } from './admine/admine.component';
import { PackageManagementComponent } from './admine/package-management/package-management.component';
import { BookingManagementComponent } from './admine/booking-management/booking-management.component';
import { DashboardComponent } from './admine/dashboard/dashboard.component';
import { UsersManagmentComponent } from './admine/users-managment/users-managment.component';

const routes: Routes = [
  {
    path: '',
      title: 'Touriste - Accueil',
    component: LayoutComponent, // Layout with header/footer
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'home',
      
        redirectTo: '',
        pathMatch: 'full',

      
      },
      {
        path: 'about',
        component: AboutComponent,
        title: 'Touriste - À Propos',
      
      },
      {
        path: 'contact',
        component: ContactComponent,
        title: 'Touriste - Contact',
      
      },
      {
        path: 'booking',
        component: BookingComponent,
        title: 'Touriste - Forfaits',
      
      },

      // {
      //   path: '**', // Route wildcard pour les pages non trouvées (404)
      //   loadChildren: () => import('./shared/components/not-found/not-found.module').then(m => m.NotFoundModule), // Ou un composant direct si simple
      //   title: 'Page Non Trouvée'
      // }
    ],
  },
  {
    path: 'details',
    component: MoreDetailsComponent,
    title: 'Touriste - Détails',
  
  },
  {
    path: 'gallery',
    component: GalleryComponent,
    title: 'Touriste - Gallery',
  
  },
  {
    path: 'admine',
    component: AdmineComponent,
    title: 'Touriste - Admine',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // default child route
      { path: 'dashboard', component: DashboardComponent },
      { path: 'PackageManagement', component: PackageManagementComponent },
      { path: 'BookingManagement', component: BookingManagementComponent },
      { path: 'UserManagement', component: UsersManagmentComponent },
    ],
  },

  {
    path: 'auth',
    title: 'Touriste - Register/Login',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
