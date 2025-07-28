import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    firstName: '',
    lastName: '',
    iam: '',
    countryCode: '+1',
    phone: '',
    otp: ''
  };
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isSubmitting = false;
  phoneInvalid = false;
  showOTPField = false;

  constructor(private authService: AuthService, private router: Router) {}

  sendOTP(): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.isSubmitting = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.errorMessage = 'Invalid email format.';
      this.isSubmitting = false;
      return;
    }

    this.authService.sendOTP(this.user.email).subscribe({
      next: (response: any) => {
        this.successMessage = response.message || 'Verification code sent to your email.';
        this.showOTPField = true;
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to send verification code.';
        this.isSubmitting = false;
      }
    });
  }

  register(form: NgForm): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.isSubmitting = true;

    if (!form.valid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      this.isSubmitting = false;
      return;
    }

    // Validate phone number
    const phoneRegex = /^[2-9]\d{9}$/;
    if (!phoneRegex.test(this.user.phone)) {
      this.phoneInvalid = true;
      this.errorMessage = 'Phone number must be 10 digits and valid for US/Canada.';
      this.isSubmitting = false;
      return;
    }

    // Validate password match
    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.isSubmitting = false;
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.user.password)) {
      this.errorMessage = 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.';
      this.isSubmitting = false;
      return;
    }

    // Combine country code + phone for backend
    const fullPhone = this.user.countryCode + this.user.phone;

    const registerUser = {
      email: this.user.email,
      password: this.user.password,
      role: this.user.role,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      iam: this.user.iam,
      phone: fullPhone,
      otp: this.user.otp
    };

    this.authService.register(registerUser).subscribe({
      next: (response: any) => {
        this.successMessage = response.message || 'User registered successfully!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error?.errors?.[0]?.msg || 'Registration failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}