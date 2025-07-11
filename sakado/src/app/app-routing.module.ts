import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './core/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AboutComponent } from './core/about/about.component';
import { ContactComponent } from './core/contact/contact.component';
import { AuthGuard } from './guards/auth.guard';
import { BookingComponent } from './core/booking/booking.component';
import { MoreDetailsComponent } from './pages/more-details/more-details.component';
import { GalleryComponent } from './core/gallery/gallery.component';
import { AdmineComponent } from './pages/admine/admine.component';
import { PackageManagementComponent } from './pages/admine/package-management/package-management.component';
import { BookingManagementComponent } from './pages/admine/booking-management/booking-management.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, // Layout with header/footer
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'home',
        redirectTo: '',
        pathMatch: 'full',
        title: 'Touriste - Accueil',
        canActivate: [AuthGuard],
      },
      {
        path: 'about',
        component: AboutComponent,
        title: 'Touriste - À Propos',
        canActivate: [AuthGuard],
      },
      {
        path: 'contact',
        component: ContactComponent,
        title: 'Touriste - Contact',
        canActivate: [AuthGuard],
      },
      {
        path: 'booking',
        component: BookingComponent,
        title: 'Touriste - Forfaits',
        canActivate: [AuthGuard],
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
    canActivate: [AuthGuard],
  },
  {
    path: 'gallery',
    component: GalleryComponent,
    title: 'Touriste - Gallery',
    canActivate: [AuthGuard],
  },
  {
    path: 'admine',
    component: AdmineComponent,
    title: 'Touriste - Gallery',
    canActivate: [AuthGuard],
        children: [
      { path: 'admine', redirectTo: 'admine', pathMatch: 'full' },  // default child route
      { path: 'PackageManagement', component: PackageManagementComponent },
      { path: 'BookingManagement', component: BookingManagementComponent },
       
    ]
  },
  {
    path: 'auth',
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
