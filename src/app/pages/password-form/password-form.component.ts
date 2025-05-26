import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Password, Category } from '../../models/password.model';
import { PasswordService } from '../../services/password.service';
import { EncryptionService } from '../../services/encryption.service';

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
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username or Email</mat-label>
                <input matInput formControlName="username" placeholder="username@example.com">
                <mat-error *ngIf="passwordForm.get('username')?.hasError('required')">
                  Username is required
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
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Website URL</mat-label>
                <input matInput formControlName="url" placeholder="https://example.com">
                <mat-icon matSuffix>link</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option *ngFor="let category of categories" [value]="category.name">
                    {{ category.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3" 
                  placeholder="Add notes or additional information"></textarea>
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
                Symbols (!@#$%^&*)
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
export class PasswordFormComponent implements OnInit {
  passwordForm!: FormGroup;
  isEditMode = false;
  hidePassword = true;
  hideGeneratedPassword = true;
  passwordId: string | null = null;
  categories: Category[] = [];
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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordService: PasswordService,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    this.checkForEditMode();
    
    // Update password strength when password changes
    this.passwordForm.get('password')?.valueChanges.subscribe(password => {
      if (password) {
        this.passwordStrength = this.passwordService.calculatePasswordStrength(password);
      } else {
        this.passwordStrength = 0;
      }
    });
  }

  initializeForm(): void {
    this.passwordForm = this.fb.group({
      title: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      url: [''],
      category: ['Personal'],
      notes: [''],
      favorite: [false]
    });
  }

  loadCategories(): void {
    this.passwordService.getCategories().subscribe(categories => {
      this.categories = categories;
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
    this.passwordService.getPassword(id).subscribe(password => {
      if (password) {
        this.passwordForm.patchValue({
          title: password.title,
          username: password.username,
          password: password.password,
          url: password.url || '',
          category: password.category || 'Personal',
          notes: password.notes || '',
          favorite: password.favorite
        });
        
        this.passwordStrength = password.strength || 0;
      }
    });
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      const passwordData = this.passwordForm.value;
      
      if (this.isEditMode && this.passwordId) {
        this.passwordService.updatePassword(this.passwordId, passwordData);
      } else {
        this.passwordService.addPassword(passwordData);
      }
      
      this.router.navigate(['/passwords']);
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
}