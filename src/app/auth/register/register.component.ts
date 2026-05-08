import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class Register implements OnInit {
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

  constructor(private authService: AuthService, private router: Router) { }

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
      return;
    }

    if (this.user.password !== this.user.confirm_password) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.user.date_birth > this.maxDate) {
      this.errorMessage = 'Debes tener al menos 10 años de edad para registrarte.';
      return;
    }

    this.isLoading = true;

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
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al registrar', error);
        this.isLoading = false;
        this.errorMessage = 'Hubo un error al registrarte. Verifica tus datos o intenta con otro correo.';
      }
    });
  }
}
