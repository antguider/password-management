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
            <p>Checking authentication...</p>
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
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-900) 0%, var(--secondary-900) 25%, var(--primary-800) 50%, var(--secondary-800) 75%, var(--primary-700) 100%);
      background-size: 400% 400%;
      animation: gradientShift 15s ease infinite;
      padding: var(--space-6);
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
      animation: floatingOrbs 20s ease-in-out infinite;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @keyframes floatingOrbs {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-30px) rotate(120deg); }
      66% { transform: translateY(15px) rotate(240deg); }
    }

    .login-card {
      background: var(--surface-glass);
      backdrop-filter: var(--glass-backdrop-strong);
      -webkit-backdrop-filter: var(--glass-backdrop-strong);
      border: 1px solid var(--glass-border-strong);
      border-radius: var(--radius-3xl);
      box-shadow: var(--shadow-3xl);
      padding: var(--space-12);
      width: 100%;
      max-width: 480px;
      text-align: center;
      position: relative;
      z-index: 10;
      animation: slideUp 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .login-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient-primary);
      border-radius: var(--radius-3xl) var(--radius-3xl) 0 0;
    }

    .login-header {
      margin-bottom: var(--space-12);
    }

    .app-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: var(--space-6);
      animation: float 6s ease-in-out infinite;
    }

    .login-header h1 {
      font-size: var(--font-size-5xl);
      font-weight: var(--font-weight-black);
      margin: 0 0 var(--space-4) 0;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: var(--letter-spacing-tighter);
      line-height: var(--line-height-none);
    }

    .login-header p {
      color: var(--text-secondary);
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-medium);
      letter-spacing: var(--letter-spacing-wide);
    }

    .login-content {
      margin-bottom: var(--space-12);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-6);
      padding: var(--space-8) 0;
    }

    .loading-container p {
      color: var(--text-secondary);
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-medium);
    }

    .login-options {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .google-signin-btn {
      height: 56px;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      background: var(--gradient-primary);
      color: var(--text-inverse);
      border: 1px solid var(--primary-700);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: var(--letter-spacing-wide);
    }

    .google-signin-btn:hover {
      background: linear-gradient(135deg, var(--primary-700), var(--primary-900));
      box-shadow: var(--shadow-xl);
      transform: translateY(-2px);
    }

    .google-signin-btn mat-icon {
      font-size: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
    }

    .divider {
      position: relative;
      text-align: center;
      margin: var(--space-4) 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--glass-border);
    }

    .divider span {
      background: var(--surface-glass);
      padding: 0 var(--space-6);
      color: var(--text-tertiary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      letter-spacing: var(--letter-spacing-wide);
    }

    .demo-btn {
      height: 56px;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      background: var(--surface-glass);
      backdrop-filter: var(--glass-backdrop);
      -webkit-backdrop-filter: var(--glass-backdrop);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-xl);
      color: var(--text-primary);
      box-shadow: var(--shadow-md);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: var(--letter-spacing-wide);
    }

    .demo-btn:hover {
      background: var(--surface-elevated);
      border-color: var(--glass-border-strong);
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .demo-btn mat-icon {
      font-size: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
    }

    .login-footer {
      border-top: 1px solid var(--glass-border);
      padding-top: var(--space-8);
    }

    .security-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin: 0;
      letter-spacing: var(--letter-spacing-wide);
    }

    .security-note mat-icon {
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
      color: var(--success-500);
      filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3));
    }

    @media (max-width: 768px) {
      .login-container {
        padding: var(--space-4);
      }

      .login-card {
        padding: var(--space-8);
        max-width: 100%;
      }

      .login-header h1 {
        font-size: var(--font-size-4xl);
      }

      .app-icon {
        font-size: 3rem;
        height: 3rem;
        width: 3rem;
      }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: var(--space-6);
      }

      .login-header h1 {
        font-size: var(--font-size-3xl);
      }

      .google-signin-btn,
      .demo-btn {
        height: 48px;
        font-size: var(--font-size-base);
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
    console.log('Login component initialized');
    
    // Subscribe to authentication state changes
    this.authService.user$.subscribe(user => {
      console.log('Auth state subscription triggered:', user ? 'User logged in' : 'User logged out');
      console.log('Auth service isLoggedIn:', this.authService.isLoggedIn());
      console.log('Auth service isAuthenticated:', this.authService.isUserAuthenticated());
      console.log('Auth service isInDemoMode:', this.authService.isInDemoMode());
      
      // If user is already authenticated or in demo mode, redirect to dashboard
      if (this.authService.isLoggedIn()) {
        console.log('User is already logged in, redirecting to dashboard');
        this.router.navigate(['/dashboard']);
      } else {
        console.log('User is not logged in, showing login screen');
      }
    });
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
