import { Component } from '@angular/core';
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

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.errorMessage = '';

    if (this.email && this.password) {
      this.isLoading = true;

      this.authService.login(this.email, this.password).subscribe({
        next: (respuesta) => {
          console.log('EXITO', respuesta);
          this.isLoading = false;
          this.router.navigate(['/clothes/dashboard']);
        },
        error: (error) => {
          console.error('Error al iniciar sesión', error);
          this.isLoading = false;
          this.errorMessage = 'Correo o contraseña incorrectos. Inténtalo de nuevo.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, llena todos los campos.';
    }
  }
}
