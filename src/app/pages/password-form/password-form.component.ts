import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Password } from '../../models/password.model';
import { PasswordService } from '../../services/password.service';
import { EncryptionService } from '../../services/encryption.service';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  template: `
    <div class="container slide-up">
      <div class="page-header">
        <h1>{{ isEditMode ? 'Edit Password' : 'Add New Password' }}</h1>
        <button mat-button routerLink="/passwords">
          <mat-icon>arrow_back</mat-icon>
          Back to Passwords
        </button>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" placeholder="e.g., Gmail, Facebook, Bank">
                <mat-error *ngIf="passwordForm.get('title')?.hasError('required')">
                  Title is required
                </mat-error>
                <mat-error *ngIf="passwordForm.get('title')?.hasError('minlength')">
                  Title must be at least 2 characters long
                </mat-error>
                <mat-error *ngIf="passwordForm.get('title')?.hasError('maxlength')">
                  Title must be less than 100 characters
                </mat-error>
                <mat-error *ngIf="passwordForm.get('title')?.hasError('whitespace')">
                  Title cannot be empty or only whitespace
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username or Email</mat-label>
                <input matInput formControlName="username" placeholder="username@example.com">
                <mat-error *ngIf="passwordForm.get('username')?.hasError('required')">
                  Username or email is required
                </mat-error>
                <mat-error *ngIf="passwordForm.get('username')?.hasError('minlength')">
                  Username must be at least 2 characters long
                </mat-error>
                <mat-error *ngIf="passwordForm.get('username')?.hasError('maxlength')">
                  Username must be less than 100 characters
                </mat-error>
                <mat-error *ngIf="passwordForm.get('username')?.hasError('invalidFormat')">
                  Please enter a valid email address or username
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row password-field-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput [type]="hidePassword ? 'password' : 'text'" 
                  formControlName="password" placeholder="Password">
                <button mat-icon-button matSuffix (click)="togglePasswordVisibility()" 
                  type="button" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="passwordForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="passwordForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters long
                </mat-error>
                <mat-error *ngIf="passwordForm.get('password')?.hasError('maxlength')">
                  Password must be less than 128 characters
                </mat-error>
                <mat-error *ngIf="passwordForm.get('password')?.hasError('noUppercase')">
                  Password must contain at least one uppercase letter
                </mat-error>
                <mat-error *ngIf="passwordForm.get('password')?.hasError('noLowercase')">
                  Password must contain at least one lowercase letter
                </mat-error>
                <mat-error *ngIf="passwordForm.get('password')?.hasError('noNumber')">
                  Password must contain at least one number
                </mat-error>
                <mat-error *ngIf="passwordForm.get('password')?.hasError('noSpecialChar')">
                  Password must contain at least one special character
                </mat-error>
                <mat-error *ngIf="passwordForm.get('password')?.hasError('repeatingChars')">
                  Password cannot have more than 2 consecutive identical characters
                </mat-error>
                <mat-error *ngIf="passwordForm.get('password')?.hasError('commonPattern')">
                  Password contains common patterns that are easy to guess
                </mat-error>
              </mat-form-field>
              
              <button mat-raised-button type="button" color="accent" class="generate-btn"
                (click)="openPasswordGenerator()">
                <mat-icon>shuffle</mat-icon>
                Generate
              </button>
            </div>

            <div class="form-row" *ngIf="passwordForm.get('password')?.value">
              <div class="password-strength-container">
                <mat-progress-bar 
                  [color]="getStrengthColor(passwordStrength)" 
                  mode="determinate" 
                  [value]="passwordStrength">
                </mat-progress-bar>
                <div class="strength-text">
                  <span>Password Strength: </span>
                  <span [class]="'strength-' + getStrengthLabel(passwordStrength).toLowerCase()">
                    {{ getStrengthLabel(passwordStrength) }}
                  </span>
                </div>
              </div>
              
              <div class="password-requirements">
                <h4>Password Requirements:</h4>
                <ul class="requirements-list">
                  <li [class.valid]="hasMinLength()">
                    <mat-icon>{{ hasMinLength() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                    At least 8 characters long
                  </li>
                  <li [class.valid]="hasUppercase()">
                    <mat-icon>{{ hasUppercase() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                    Contains uppercase letter
                  </li>
                  <li [class.valid]="hasLowercase()">
                    <mat-icon>{{ hasLowercase() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                    Contains lowercase letter
                  </li>
                  <li [class.valid]="hasNumber()">
                    <mat-icon>{{ hasNumber() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                    Contains number
                  </li>
                  <li [class.valid]="hasSpecialChar()">
                    <mat-icon>{{ hasSpecialChar() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                    Contains special character
                  </li>
                  <li [class.valid]="!hasRepeatingChars()">
                    <mat-icon>{{ !hasRepeatingChars() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                    No repeating characters
                  </li>
                </ul>
              </div>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Website URL</mat-label>
                <input matInput formControlName="url" placeholder="https://example.com">
                <mat-icon matSuffix>link</mat-icon>
                <mat-error *ngIf="passwordForm.get('url')?.hasError('invalidUrl')">
                  Please enter a valid URL (e.g., https://example.com)
                </mat-error>
              </mat-form-field>
            </div>


            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3" 
                  placeholder="Add notes or additional information"></textarea>
                <mat-error *ngIf="passwordForm.get('notes')?.hasError('maxlength')">
                  Notes must be less than 500 characters
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row favorite-toggle">
              <mat-slide-toggle formControlName="favorite" color="accent">
                <div class="toggle-label">
                  <mat-icon>star</mat-icon>
                  <span>Add to Favorites</span>
                </div>
              </mat-slide-toggle>
            </div>

            <mat-divider class="form-divider"></mat-divider>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/passwords">Cancel</button>
              <button mat-raised-button color="primary" type="submit" 
                [disabled]="passwordForm.invalid">
                {{ isEditMode ? 'Update Password' : 'Save Password' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="showPasswordGenerator" class="generator-card slide-up">
        <mat-card-header>
          <mat-card-title>Password Generator</mat-card-title>
          <button mat-icon-button (click)="closePasswordGenerator()" class="close-button">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <div class="generator-options">
            <div class="password-length-slider">
              <label>Password Length: {{ generatorOptions.length }}</label>
              <mat-slider min="8" max="32" step="1" [discrete]="true" class="full-width">
                <input matSliderThumb [(ngModel)]="generatorOptions.length">
              </mat-slider>
            </div>

            <div class="character-options">
              <mat-slide-toggle 
                [(ngModel)]="generatorOptions.includeUppercase" 
                color="primary">
                Uppercase Letters (A-Z)
              </mat-slide-toggle>
              
              <mat-slide-toggle 
                [(ngModel)]="generatorOptions.includeLowercase" 
                color="primary">
                Lowercase Letters (a-z)
              </mat-slide-toggle>
              
              <mat-slide-toggle 
                [(ngModel)]="generatorOptions.includeNumbers" 
                color="primary">
                Numbers (0-9)
              </mat-slide-toggle>
              
              <mat-slide-toggle 
                [(ngModel)]="generatorOptions.includeSymbols" 
                color="primary">
                Symbols (!#$%^&*)
              </mat-slide-toggle>
              
              <mat-slide-toggle 
                [(ngModel)]="generatorOptions.excludeSimilarCharacters" 
                color="primary">
                Exclude Similar Characters (i, l, 1, L, o, 0, O)
              </mat-slide-toggle>
            </div>
          </div>

          <div class="generated-password-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Generated Password</mat-label>
              <input matInput [type]="hideGeneratedPassword ? 'password' : 'text'" 
                [(ngModel)]="generatedPassword" [readonly]="true">
              <button mat-icon-button matSuffix (click)="toggleGeneratedPasswordVisibility()" 
                type="button">
                <mat-icon>{{ hideGeneratedPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <div class="generator-actions">
              <button mat-stroked-button (click)="generatePassword()">
                <mat-icon>shuffle</mat-icon>
                Generate New
              </button>
              <button mat-raised-button color="primary" (click)="useGeneratedPassword()">
                <mat-icon>check</mat-icon>
                Use This Password
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 400;
      margin: 0;
      color: #3F51B5;
    }

    .form-card {
      margin-bottom: 24px;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .password-field-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .generate-btn {
      margin-top: 4px;
    }

    .password-strength-container {
      margin-top: -8px;
      margin-bottom: 16px;
    }

    .strength-text {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      font-size: 14px;
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

    .password-requirements {
      margin-top: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .password-requirements h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #495057;
    }

    .requirements-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
    }

    .requirements-list li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6c757d;
      transition: color 0.3s ease;
    }

    .requirements-list li.valid {
      color: #28a745;
    }

    .requirements-list li mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .requirements-list li.valid mat-icon {
      color: #28a745;
    }

    .favorite-toggle {
      margin: 16px 0;
    }

    .toggle-label {
      display: flex;
      align-items: center;
    }

    .toggle-label mat-icon {
      margin-right: 8px;
      color: #FFC107;
    }

    .form-divider {
      margin: 24px 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }

    /* Password Generator Styles */
    .generator-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-button {
      margin-right: -8px;
    }

    .generator-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .password-length-slider {
      margin-bottom: 8px;
    }

    .character-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .generated-password-container {
      margin-top: 16px;
    }

    .generator-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .password-field-row {
        flex-direction: column;
      }

      .generate-btn {
        width: 100%;
        margin-top: -8px;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class PasswordFormComponent implements OnInit, OnDestroy {
  passwordForm!: FormGroup;
  isEditMode = false;
  hidePassword = true;
  hideGeneratedPassword = true;
  passwordId: string | null = null;
  passwordStrength = 0;
  
  // Password Generator
  showPasswordGenerator = false;
  generatedPassword = '';
  generatorOptions = {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilarCharacters: false,
    excludeAmbiguousCharacters: false
  };

  private destroy$ = new BehaviorSubject<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordService: PasswordService,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkForEditMode();
    
    // Update password strength when password changes
    this.passwordForm.get('password')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(password => {
      if (password) {
        this.passwordStrength = this.passwordService.calculatePasswordStrength(password);
      } else {
        this.passwordStrength = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.passwordForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.noWhitespaceValidator
      ]],
      username: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.emailOrUsernameValidator
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        this.passwordStrengthValidator
      ]],
      url: ['', [
        this.urlValidator
      ]],
      notes: ['', [
        Validators.maxLength(500)
      ]],
      favorite: [false]
    });
  }


  checkForEditMode(): void {
    this.passwordId = this.route.snapshot.paramMap.get('id');
    
    if (this.passwordId) {
      this.isEditMode = true;
      this.loadPasswordData(this.passwordId);
    }
  }

  loadPasswordData(id: string): void {
    this.passwordService.getPassword(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe(password => {
      if (password) {
        this.passwordForm.patchValue({
          title: password.title,
          username: password.username,
          password: password.password,
          url: password.url || '',
          notes: password.notes || '',
          favorite: password.favorite
        });
        
        this.passwordStrength = password.strength || 0;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.passwordForm.valid) {
      const passwordData = this.passwordForm.value;
      
      try {
        if (this.isEditMode && this.passwordId) {
          await this.passwordService.updatePassword(this.passwordId, passwordData);
        } else {
          await this.passwordService.addPassword(passwordData);
        }
        
        this.router.navigate(['/passwords']);
      } catch (error) {
        console.error('Error saving password:', error);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
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

  openPasswordGenerator(): void {
    this.showPasswordGenerator = true;
    this.generatePassword();
  }

  closePasswordGenerator(): void {
    this.showPasswordGenerator = false;
  }

  generatePassword(): void {
    this.generatedPassword = this.encryptionService.generateRandomPassword(
      this.generatorOptions.length,
      this.generatorOptions.includeUppercase,
      this.generatorOptions.includeLowercase,
      this.generatorOptions.includeNumbers,
      this.generatorOptions.includeSymbols,
      this.generatorOptions.excludeSimilarCharacters,
      this.generatorOptions.excludeAmbiguousCharacters
    );
  }

  toggleGeneratedPasswordVisibility(): void {
    this.hideGeneratedPassword = !this.hideGeneratedPassword;
  }

  useGeneratedPassword(): void {
    this.passwordForm.get('password')?.setValue(this.generatedPassword);
    this.closePasswordGenerator();
  }

  // Custom Validators
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  emailOrUsernameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const value = control.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    
    if (emailRegex.test(value) || usernameRegex.test(value)) {
      return null;
    }
    
    return { invalidFormat: true };
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const password = control.value;
    const errors: ValidationErrors = {};
    
    // Check minimum length
    if (password.length < 8) {
      errors['minLength'] = true;
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors['noUppercase'] = true;
    }
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors['noLowercase'] = true;
    }
    
    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      errors['noNumber'] = true;
    }
    
    // Check for at least one special character
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors['noSpecialChar'] = true;
    }
    
    // Check for common weak patterns
    if (/(.)\1{2,}/.test(password)) {
      errors['repeatingChars'] = true;
    }
    
    if (/(123|abc|qwe|asd|zxc)/i.test(password)) {
      errors['commonPattern'] = true;
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }

  urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const url = control.value.trim();
    if (url === '') return null;
    
    try {
      // Add protocol if missing
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : 'https://' + url;
      
      new URL(urlWithProtocol);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  }

  // Helper methods for password requirements
  hasMinLength(): boolean {
    const password = this.passwordForm.get('password')?.value || '';
    return password.length >= 8;
  }

  hasUppercase(): boolean {
    const password = this.passwordForm.get('password')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasLowercase(): boolean {
    const password = this.passwordForm.get('password')?.value || '';
    return /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.passwordForm.get('password')?.value || '';
    return /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.passwordForm.get('password')?.value || '';
    return /[^A-Za-z0-9]/.test(password);
  }

  hasRepeatingChars(): boolean {
    const password = this.passwordForm.get('password')?.value || '';
    return /(.)\1{2,}/.test(password);
  }

}