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
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss'],
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
    if (strength < 50) {
      return 'Weak'
    }
    if (strength < 75)  {
      return 'Medium';
    }
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