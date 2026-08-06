import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/usuario.model';

export const roleGuard = (...roles: RolUsuario[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      void router.navigate(['/login']);
      return false;
    }

    if (!authService.hasRol(roles)) {
      void router.navigate(['/acceso-denegado']);
      return false;
    }

    return true;
  };
};
