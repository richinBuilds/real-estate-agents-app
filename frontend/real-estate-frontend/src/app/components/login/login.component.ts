import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  credentials = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    console.log('Sending credentials:', this.credentials); 
    this.authService.login(this.credentials).subscribe({
      next: (data) => {
        this.authService.setToken(data.token);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login failed:', err); 
        alert('Login failed');
      }
    });
  }
}
