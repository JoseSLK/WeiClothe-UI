import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class Register implements OnInit {
  tenantName = environment.tenantName;
  logoUrl = environment.logoUrl;

  user = {
    first_name: '',
    last_name: '',
    nickname: '',
    email: '',
    password: '',
    confirm_password: '',
    date_birth: '',
    gender: ''
  };

  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  maxDate: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 10);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    this.maxDate = `${year}-${month}-${day}`;
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.user.first_name || !this.user.last_name || !this.user.nickname ||
      !this.user.email || !this.user.password || !this.user.confirm_password || !this.user.date_birth || !this.user.gender) {
      this.errorMessage = 'Por favor, llena todos los campos.';
      this.cdr.detectChanges();
      return;
    }

    if (this.user.password !== this.user.confirm_password) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.cdr.detectChanges();
      return;
    }

    if (this.user.date_birth > this.maxDate) {
      this.errorMessage = 'Debes tener al menos 10 años de edad para registrarte.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const payload = {
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      nickname: this.user.nickname,
      email: this.user.email,
      password: this.user.password,
      date_birth: this.user.date_birth,
      gender: this.user.gender
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al registrar', error);
        this.isLoading = false;
        
        if (error.status === 400 && error.error?.error) {
          // Extraer error de validación de Go (ej: password muy corto)
          const goError = error.error.error;
          if (goError.includes('Password') && goError.includes('min')) {
             this.errorMessage = 'La contraseña es muy corta. Revisa los requisitos.';
          } else {
             this.errorMessage = `Error de validación: ${goError}`;
          }
        } else if (error.status === 409) {
          this.errorMessage = 'El correo o nickname ya están en uso.';
        } else {
          this.errorMessage = 'Hubo un error al registrarte. Verifica tus datos o intenta más tarde.';
        }
        
        this.cdr.detectChanges();
      }
    });
  }
}
