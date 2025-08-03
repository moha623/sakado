// admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.hasRole('admin').pipe(
    take(1),
    map(isAdmin => {
      if (!isAdmin) router.navigate(['/access-denied']);
      return isAdmin;
    })
  );
};