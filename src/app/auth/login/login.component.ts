import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class Login {
  email = '';
  password = '';

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  onSubmit() {
    this.errorMessage = '';

    if (this.email && this.password) {
      this.isLoading = true;
      this.cdr.detectChanges(); // Forzar actualización visual

      this.authService.login(this.email, this.password).subscribe({
        next: (respuesta) => {
          console.log('EXITO', respuesta);
          this.isLoading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/clothes/dashboard']);
        },
        error: (error) => {
          console.error('Error al iniciar sesión', error);
          this.isLoading = false;
          
          if (error.name === 'TimeoutError') {
            this.errorMessage = 'Tiempo de espera agotado. Verifica tu conexión.';
          } else if (error.status === 401 || error.status === 403) {
            this.errorMessage = 'Correo o contraseña incorrectos.';
          } else if (error.status === 500) {
            this.errorMessage = 'Error interno del servidor.';
          } else {
             this.errorMessage = 'Hubo un error de conexión con el servidor.';
          }
          
          this.cdr.detectChanges(); // Forzar a que Angular quite el spinner y muestre el mensaje
        }
      });
    } else {
      this.errorMessage = 'Por favor, llena todos los campos.';
      this.cdr.detectChanges();
    }
  }
}
