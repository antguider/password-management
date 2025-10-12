import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <mat-icon class="app-icon">vpn_key</mat-icon>
          <h1>Vault</h1>
          <p>Your secure password manager</p>
        </div>

        <div class="login-content">
          <div *ngIf="authService.loading()" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Signing in...</p>
          </div>

          <div *ngIf="!authService.loading()" class="login-options">
            <button 
              mat-raised-button 
              color="primary" 
              class="google-signin-btn"
              (click)="signInWithGoogle()"
              [disabled]="authService.loading()">
              <mat-icon>login</mat-icon>
              Sign in with Google
            </button>

            <div class="divider">
              <span>or</span>
            </div>

            <button 
              mat-stroked-button 
              class="demo-btn"
              (click)="signInAsDemo()"
              [disabled]="authService.loading()">
              <mat-icon>visibility</mat-icon>
              Try Demo (No Login)
            </button>
          </div>
        </div>

        <div class="login-footer">
          <p class="security-note">
            <mat-icon>security</mat-icon>
            Your passwords are encrypted and secure
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
      text-align: center;
    }

    .login-header {
      margin-bottom: 32px;
    }

    .app-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #3F51B5;
      margin-bottom: 16px;
    }

    .login-header h1 {
      font-size: 32px;
      font-weight: 300;
      margin: 0 0 8px 0;
      color: #333;
    }

    .login-header p {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .login-content {
      margin-bottom: 32px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 20px 0;
    }

    .loading-container p {
      color: #666;
      margin: 0;
    }

    .login-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .google-signin-btn {
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .google-signin-btn mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 8px 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }

    .divider span {
      background: white;
      padding: 0 16px;
      color: #666;
      font-size: 14px;
    }

    .demo-btn {
      height: 48px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .demo-btn mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    .login-footer {
      border-top: 1px solid #e0e0e0;
      padding-top: 20px;
    }

    .security-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .security-note mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      color: #4CAF50;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 10px;
      }

      .login-card {
        padding: 24px;
      }

      .login-header h1 {
        font-size: 28px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // If user is already authenticated or in demo mode, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
      this.snackBar.open('Successfully signed in!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    } catch (error) {
      console.error('Sign in error:', error);
      this.snackBar.open('Failed to sign in. Please try again.', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  signInAsDemo(): void {
    // Enable demo mode and navigate to dashboard
    this.authService.enableDemoMode();
    this.router.navigate(['/dashboard']);
    this.snackBar.open('Demo mode activated', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
