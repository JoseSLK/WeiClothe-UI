import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  let modifiedReq = req;

  // Only attach Bearer to /clothes routes (users routes are public)
  if (token && req.url.includes('/clothes')) {
    modifiedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 on clothes routes — users 401 is just bad credentials
      if (error.status === 401 && req.url.includes('/clothes')) {
        console.warn('Interceptor: El token expiró o es inválido. Cerrando sesión de emergencia...');
        localStorage.removeItem('token');
        // Redirigimos forzosamente al login
        router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
