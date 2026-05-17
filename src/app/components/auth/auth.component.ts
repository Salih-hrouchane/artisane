import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

  mode: 'login' | 'signup' = 'login';

  // Login fields
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;

  // Signup fields
  signupName = '';
  signupUsername = '';
  signupEmail = '';
  signupPassword = '';
  signupError = '';
  signupLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  switchTo(m: 'login' | 'signup') {
    this.mode = m;
    this.loginError = '';
    this.signupError = '';
  }

  onLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Veuillez remplir tous les champs.';
      return;
    }
    this.loginLoading = true;
    this.loginError = '';

    setTimeout(() => {
      const result = this.auth.login(this.loginEmail, this.loginPassword);
      this.loginLoading = false;
      if (result.success) {
        this.router.navigate(['/feed']);
      } else {
        this.loginError = result.error || 'Erreur de connexion.';
      }
    }, 600);
  }

  onSignup() {
    if (!this.signupName || !this.signupUsername || !this.signupEmail || !this.signupPassword) {
      this.signupError = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.signupPassword.length < 6) {
      this.signupError = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    this.signupLoading = true;
    this.signupError = '';

    setTimeout(() => {
      const result = this.auth.signUp(
        this.signupName,
        this.signupUsername.replace('@', ''),
        this.signupEmail,
        this.signupPassword
      );
      this.signupLoading = false;
      if (result.success) {
        this.router.navigate(['/feed']);
      } else {
        this.signupError = result.error || 'Erreur lors de la création du compte.';
      }
    }, 600);
  }
}
