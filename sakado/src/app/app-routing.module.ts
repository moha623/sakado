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
        canActivate: [AuthGuard]
      },
      {
        path: 'about',
        component: AboutComponent,
        title: 'Touriste - À Propos',
      },
      {
        path: 'contact',
        component: ContactComponent,
         title: 'Touriste - Contact'
      },
         {
        path: 'booking',
        component: BookingComponent,
        title: 'Touriste - Forfaits'
      },
 
   
 
      // {
      //   path: '**', // Route wildcard pour les pages non trouvées (404)
      //   loadChildren: () => import('./shared/components/not-found/not-found.module').then(m => m.NotFoundModule), // Ou un composant direct si simple
      //   title: 'Page Non Trouvée'
      // }
    ],
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
