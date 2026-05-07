import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';

export const authGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    console.log('AuthGuard: Token encontrado. Acceso permitido a', state.url);
    return true; // Allow access
  } else {
    console.warn('AuthGuard: No hay token. Redirigiendo al Login desde', state.url);
    return router.createUrlTree(['/']);
  }
};
