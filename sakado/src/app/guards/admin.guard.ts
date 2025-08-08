// admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.currentUser$.pipe(
    take(1),
    map(user => {
      if (user?.role === 'admin') return true;
      
      // Redirect based on user status
      if (user?.role==='user') router.navigate(['/access-denied']); // Authenticated but not admin
      else router.navigate(['/login']); // Not authenticated
      return false;
    })
  );
};