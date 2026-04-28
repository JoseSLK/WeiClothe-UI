import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class Login {
  // Variables that will connect with the HTML
  email = '';
  password = '';

  // Inject the service and the router
  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    if (this.email && this.password) {
      // Call the function  in auth.ts
      this.authService.login(this.email, this.password).subscribe({
        next: (respuesta) => {
          console.log('EXITO', respuesta);
          this.router.navigate(['/clothes/dashboard']);
        },
        error: (error) => {
          console.error('Error al iniciar sesión', error);
          alert('Correo o contraseña incorrectos');
        }
      });
    } else {
      alert('Por favor, llena todos los campos');
    }
  }
}
