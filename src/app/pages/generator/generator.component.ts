import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EncryptionService } from '../../services/encryption.service';
import { ClipboardService } from '../../services/clipboard.service';
import { PasswordService } from '../../services/password.service';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  template: `
    <div class="container slide-up">
      <div class="page-header">
        <h1>Password Generator</h1>
      </div>

      <div class="generator-grid">
        <mat-card class="generator-card options-card">
          <mat-card-header>
            <mat-card-title>Generator Options</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="password-length">
              <label>Password Length: {{ options.length }}</label>
              <div class="length-slider">
                <mat-slider min="4" max="64" step="1" [discrete]="true" class="full-width">
                  <input matSliderThumb [(ngModel)]="options.length" (input)="generatePassword()">
                </mat-slider>
              </div>
            </div>

            <div class="options-list">
              <mat-slide-toggle 
                [(ngModel)]="options.includeUppercase" 
                color="primary"
                (change)="generatePassword()">
                Uppercase Letters (A-Z)
              </mat-slide-toggle>
              
              <mat-slide-toggle 
                [(ngModel)]="options.includeLowercase" 
                color="primary"
                (change)="generatePassword()">
                Lowercase Letters (a-z)
              </mat-slide-toggle>
              
              <mat-slide-toggle 
                [(ngModel)]="options.includeNumbers" 
                color="primary"
                (change)="generatePassword()">
                Numbers (0-9)
              </mat-slide-toggle>
              
              <mat-slide-toggle 
                [(ngModel)]="options.includeSymbols" 
                color="primary"
                (change)="generatePassword()">
                Symbols (!@#$%^&*)
              </mat-slide-toggle>
              
              <mat-slide-toggle 
                [(ngModel)]="options.excludeSimilarCharacters" 
                color="primary"
                (change)="generatePassword()">
                Exclude Similar Characters (i, l, 1, L, o, 0, O)
              </mat-slide-toggle>
              
              <mat-slide-toggle 
                [(ngModel)]="options.excludeAmbiguousCharacters" 
                color="primary"
                (change)="generatePassword()">
                Exclude Ambiguous Characters ({}, [], (), /, \, etc.)
              </mat-slide-toggle>
            </div>

            <div class="preset-buttons">
              <button mat-stroked-button (click)="usePreset('strong')">
                Strong Password
              </button>
              <button mat-stroked-button (click)="usePreset('memorable')">
                Memorable Password
              </button>
              <button mat-stroked-button (click)="usePreset('pin')">
                PIN
              </button>
              <button mat-stroked-button (click)="usePreset('passphrase')">
                Passphrase
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="generator-card result-card">
          <mat-card-header>
            <mat-card-title>Generated Password</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="password-container">
              <mat-form-field appearance="outline" class="full-width">
                <input matInput 
                  [type]="hidePassword ? 'password' : 'text'"
                  [(ngModel)]="generatedPassword"
                  readonly>
                <button mat-icon-button matSuffix (click)="togglePasswordVisibility()">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <div class="password-strength">
                <div class="strength-label">
                  <span>Password Strength:</span>
                  <span [class]="'strength-' + getStrengthLabel(passwordStrength).toLowerCase()">
                    {{ getStrengthLabel(passwordStrength) }}
                  </span>
                </div>
                <mat-progress-bar 
                  [color]="getStrengthColor(passwordStrength)" 
                  mode="determinate" 
                  [value]="passwordStrength">
                </mat-progress-bar>
              </div>

              <div class="result-actions">
                <button mat-raised-button color="primary" (click)="copyToClipboard()">
                  <mat-icon>content_copy</mat-icon>
                  Copy to Clipboard
                </button>
                <button mat-raised-button color="accent" (click)="generatePassword()">
                  <mat-icon>refresh</mat-icon>
                  Generate New
                </button>
                <a mat-raised-button color="primary" routerLink="/passwords/new">
                  <mat-icon>save</mat-icon>
                  Save Password
                </a>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="generator-card tips-card">
          <mat-card-header>
            <mat-card-title>Password Tips</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="tips-list">
              <div class="tip-item">
                <mat-icon>security</mat-icon>
                <div class="tip-content">
                  <h3>Use unique passwords</h3>
                  <p>Never reuse passwords across different sites or services.</p>
                </div>
              </div>
              
              <div class="tip-item">
                <mat-icon>vpn_key</mat-icon>
                <div class="tip-content">
                  <h3>Longer is better</h3>
                  <p>Aim for at least 12 characters for strong security.</p>
                </div>
              </div>
              
              <div class="tip-item">
                <mat-icon>shuffle</mat-icon>
                <div class="tip-content">
                  <h3>Mix character types</h3>
                  <p>Combine uppercase, lowercase, numbers, and symbols for the strongest passwords.</p>
                </div>
              </div>
              
              <div class="tip-item">
                <mat-icon>update</mat-icon>
                <div class="tip-content">
                  <h3>Change regularly</h3>
                  <p>Update important passwords every 3-6 months.</p>
                </div>
              </div>
              
              <div class="tip-item">
                <mat-icon>phonelink_lock</mat-icon>
                <div class="tip-content">
                  <h3>Enable 2FA</h3>
                  <p>Use two-factor authentication whenever possible for an extra layer of security.</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 400;
      margin: 0;
      color: #3F51B5;
    }

    .generator-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .generator-card {
      height: 100%;
    }

    .options-card {
      grid-column: span 1;
    }

    .result-card {
      grid-column: span 1;
    }

    .tips-card {
      grid-column: span 2;
    }

    .full-width {
      width: 100%;
    }

    .password-length {
      margin-bottom: 24px;
    }

    .length-slider {
      margin-top: 8px;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .preset-buttons {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .password-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .password-strength {
      margin-bottom: 16px;
    }

    .strength-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .strength-weak {
      color: #f44336;
    }

    .strength-medium {
      color: #ff9800;
    }

    .strength-strong {
      color: #4caf50;
    }

    .result-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .tips-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      background-color: #f5f5f7;
      border-radius: 8px;
      transition: transform 0.2s ease;
    }

    .tip-item:hover {
      transform: translateY(-2px);
    }

    .tip-item mat-icon {
      color: #3F51B5;
    }

    .tip-content h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .tip-content p {
      margin: 0;
      color: #666;
    }

    @media (max-width: 959px) {
      .generator-grid {
        grid-template-columns: 1fr;
      }

      .options-card, .result-card, .tips-card {
        grid-column: span 1;
      }
    }

    @media (max-width: 599px) {
      .preset-buttons, .result-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GeneratorComponent {
  generatedPassword = '';
  hidePassword = true;
  passwordStrength = 0;
  
  options = {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilarCharacters: false,
    excludeAmbiguousCharacters: false
  };

  constructor(
    private encryptionService: EncryptionService,
    private clipboardService: ClipboardService,
    private passwordService: PasswordService
  ) {
    this.generatePassword();
  }

  generatePassword(): void {
    // Ensure at least one character type is selected
    if (!this.options.includeUppercase && 
        !this.options.includeLowercase && 
        !this.options.includeNumbers && 
        !this.options.includeSymbols) {
      this.options.includeLowercase = true;
    }
    
    this.generatedPassword = this.encryptionService.generateRandomPassword(
      this.options.length,
      this.options.includeUppercase,
      this.options.includeLowercase,
      this.options.includeNumbers,
      this.options.includeSymbols,
      this.options.excludeSimilarCharacters,
      this.options.excludeAmbiguousCharacters
    );
    
    this.passwordStrength = this.passwordService.calculatePasswordStrength(this.generatedPassword);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  copyToClipboard(): void {
    this.clipboardService.copyToClipboard(this.generatedPassword, 30000)
      .then(success => {
        if (success) {
          // Toast notification would go here in a real app
          console.log('Password copied to clipboard! Will clear in 30 seconds.');
        }
      });
  }

  getStrengthColor(strength: number): string {
    if (strength < 50) return 'warn';
    if (strength < 75) return 'accent';
    return 'primary';
  }

  getStrengthLabel(strength: number): string {
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Medium';
    return 'Strong';
  }

  usePreset(preset: string): void {
    switch (preset) {
      case 'strong':
        this.options = {
          length: 20,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSymbols: true,
          excludeSimilarCharacters: true,
          excludeAmbiguousCharacters: false
        };
        break;
      case 'memorable':
        this.options = {
          length: 12,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSymbols: false,
          excludeSimilarCharacters: true,
          excludeAmbiguousCharacters: true
        };
        break;
      case 'pin':
        this.options = {
          length: 6,
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: true,
          includeSymbols: false,
          excludeSimilarCharacters: false,
          excludeAmbiguousCharacters: false
        };
        break;
      case 'passphrase':
        this.options = {
          length: 16,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: false,
          includeSymbols: false,
          excludeSimilarCharacters: false,
          excludeAmbiguousCharacters: true
        };
        break;
    }
    
    this.generatePassword();
  }
}