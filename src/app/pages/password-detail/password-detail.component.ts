import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Password, PasswordHistory } from '../../models/password.model';
import { PasswordService } from '../../services/password.service';
import { ClipboardService } from '../../services/clipboard.service';

@Component({
  selector: 'app-password-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatExpansionModule
  ],
  template: `
    <div class="container slide-up" *ngIf="password">
      <div class="page-header">
        <h1>{{ password.title }}</h1>
        <div class="header-actions">
          <a mat-stroked-button routerLink="/passwords">
            <mat-icon>arrow_back</mat-icon>
            Back
          </a>
          <a mat-raised-button color="primary" [routerLink]="['/passwords', password.id, 'edit']">
            <mat-icon>edit</mat-icon>
            Edit
          </a>
        </div>
      </div>

      <div class="detail-grid">
        <mat-card class="detail-card info-card">
          <mat-card-header>
            <mat-card-title class="card-title">
              <div class="title-with-favorite">
                <span>Account Details</span>
                <button mat-icon-button color="warn" class="favorite-button" 
                  (click)="toggleFavorite()" matTooltip="Toggle favorite">
                  <mat-icon>{{ password.favorite ? 'star' : 'star_border' }}</mat-icon>
                </button>
              </div>
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="detail-row">
              <div class="detail-label">Username</div>
              <div class="detail-value with-copy">
                <span class="masked-value">{{ password.username }}</span>
                <button mat-icon-button matTooltip="Copy username" (click)="copyUsername()">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Password</div>
              <div class="detail-value with-copy">
                <span class="masked-value">{{ hidePassword ? '••••••••••••' : password.password }}</span>
                <div class="password-actions">
                  <button mat-icon-button matTooltip="Toggle visibility" (click)="togglePasswordVisibility()">
                    <mat-icon>{{ hidePassword ? 'visibility' : 'visibility_off' }}</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Copy password" (click)="copyPassword()">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="detail-row" *ngIf="password.url">
              <div class="detail-label">Website</div>
              <div class="detail-value with-copy">
                <a [href]="ensureHttpUrl(password.url)" target="_blank" class="website-link">
                  {{ password.url }}
                  <mat-icon class="mini-icon">open_in_new</mat-icon>
                </a>
              </div>
            </div>
            
            
            <div class="detail-row" *ngIf="password.notes">
              <div class="detail-label">Notes</div>
              <div class="detail-value notes-value">
                {{ password.notes }}
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="detail-card strength-card">
          <mat-card-header>
            <mat-card-title class="card-title">Password Strength</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="strength-meter">
              <mat-progress-bar 
                [color]="getStrengthColor(password.strength || 0)" 
                mode="determinate" 
                [value]="password.strength || 0">
              </mat-progress-bar>
              <div class="strength-label">
                {{ getStrengthLabel(password.strength || 0) }}
                <span class="strength-score">{{ password.strength || 0 }}/100</span>
              </div>
            </div>
            
            <div class="strength-details">
              <div class="strength-detail" [class.detail-check]="hasUppercase(password.password)">
                <mat-icon>{{ hasUppercase(password.password) ? 'check_circle' : 'cancel' }}</mat-icon>
                <span>Contains uppercase letters</span>
              </div>
              <div class="strength-detail" [class.detail-check]="hasLowercase(password.password)">
                <mat-icon>{{ hasLowercase(password.password) ? 'check_circle' : 'cancel' }}</mat-icon>
                <span>Contains lowercase letters</span>
              </div>
              <div class="strength-detail" [class.detail-check]="hasNumbers(password.password)">
                <mat-icon>{{ hasNumbers(password.password) ? 'check_circle' : 'cancel' }}</mat-icon>
                <span>Contains numbers</span>
              </div>
              <div class="strength-detail" [class.detail-check]="hasSymbols(password.password)">
                <mat-icon>{{ hasSymbols(password.password) ? 'check_circle' : 'cancel' }}</mat-icon>
                <span>Contains special characters</span>
              </div>
              <div class="strength-detail" [class.detail-check]="isLongEnough(password.password)">
                <mat-icon>{{ isLongEnough(password.password) ? 'check_circle' : 'cancel' }}</mat-icon>
                <span>Length ≥ 12 characters</span>
              </div>
            </div>

            <div class="strength-actions" *ngIf="getStrengthLabel(password.strength || 0) !== 'Strong'">
              <a mat-stroked-button color="primary" [routerLink]="['/passwords', password.id, 'edit']">
                <mat-icon>security</mat-icon>
                Improve Password
              </a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="detail-card meta-card">
          <mat-card-header>
            <mat-card-title class="card-title">Additional Information</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="detail-row">
              <div class="detail-label">Created</div>
              <div class="detail-value">{{ password.createdAt | date:'medium' }}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Last Updated</div>
              <div class="detail-value">{{ password.updatedAt | date:'medium' }}</div>
            </div>
            
            <div class="detail-row" *ngIf="password.lastUsed">
              <div class="detail-label">Last Used</div>
              <div class="detail-value">{{ password.lastUsed | date:'medium' }}</div>
            </div>
            
            <mat-divider class="divider"></mat-divider>
            
            <mat-expansion-panel class="history-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  Password History
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div *ngIf="passwordHistory.length === 0" class="empty-history">
                No password history available
              </div>
              
              <div *ngIf="passwordHistory.length > 0" class="history-list">
                <div *ngFor="let history of passwordHistory" class="history-item">
                  <div class="history-password">
                    <span class="masked-value">{{ hideHistoryPasswords ? '••••••••••••' : history.oldPassword }}</span>
                    <button mat-icon-button (click)="toggleHistoryPasswordVisibility()">
                      <mat-icon>{{ hideHistoryPasswords ? 'visibility' : 'visibility_off' }}</mat-icon>
                    </button>
                  </div>
                  <div class="history-date">
                    {{ history.changedAt | date:'medium' }}
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-card-content>
        </mat-card>

        <mat-card class="detail-card actions-card">
          <mat-card-header>
            <mat-card-title class="card-title">Actions</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="action-buttons">
              <button mat-raised-button color="primary" (click)="copyPassword()">
                <mat-icon>content_copy</mat-icon>
                Copy Password
              </button>
              
              <button mat-raised-button color="accent" [routerLink]="['/passwords', password.id, 'edit']">
                <mat-icon>edit</mat-icon>
                Edit Password
              </button>
              
              <button mat-raised-button color="warn" (click)="confirmDelete()">
                <mat-icon>delete</mat-icon>
                Delete Password
              </button>

              <a mat-stroked-button *ngIf="password.url" [href]="ensureHttpUrl(password.url)" target="_blank">
                <mat-icon>open_in_new</mat-icon>
                Go to Website
              </a>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
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

    .header-actions {
      display: flex;
      gap: 16px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .detail-card {
      height: 100%;
    }

    .info-card, .strength-card {
      grid-column: span 1;
    }

    .meta-card, .actions-card {
      grid-column: span 1;
    }

    .card-title {
      font-size: 20px;
      font-weight: 400;
      margin-bottom: 16px;
    }

    .title-with-favorite {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .detail-row {
      margin-bottom: 16px;
    }

    .detail-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 16px;
    }

    .with-copy {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
    }

    .masked-value {
      flex: 1;
      word-break: break-all;
    }

    .password-actions {
      display: flex;
    }

    .website-link {
      display: flex;
      align-items: center;
      color: #3F51B5;
      text-decoration: none;
    }

    .website-link:hover {
      text-decoration: underline;
    }

    .mini-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      margin-left: 4px;
    }

    .notes-value {
      white-space: pre-line;
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      min-height: 80px;
    }

    /* Strength Card Styles */
    .strength-meter {
      margin-bottom: 16px;
    }

    .strength-label {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-weight: 500;
    }

    .strength-score {
      font-weight: 400;
      color: #666;
    }

    .strength-details {
      margin: 16px 0;
    }

    .strength-detail {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: #f44336;
    }

    .strength-detail mat-icon {
      margin-right: 8px;
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    .detail-check {
      color: #4caf50;
    }

    .strength-actions {
      margin-top: 16px;
    }

    /* Meta Card Styles */
    .divider {
      margin: 16px 0;
    }

    .history-panel {
      margin-top: 16px;
      box-shadow: none;
    }

    .empty-history {
      color: #666;
      font-style: italic;
      margin: 16px 0;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-item {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
    }

    .history-password {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .history-date {
      font-size: 12px;
      color: #666;
    }

    /* Actions Card Styles */
    .action-buttons {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    @media (max-width: 959px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }

      .info-card, .strength-card, .meta-card, .actions-card {
        grid-column: span 1;
      }
      
      .header-actions {
        flex-direction: column;
        gap: 8px;
      }
    }

    @media (max-width: 599px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions a {
        width: 100%;
      }

      .action-buttons {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PasswordDetailComponent implements OnInit {
  password: Password | undefined;
  passwordHistory: PasswordHistory[] = [];
  hidePassword = true;
  hideHistoryPasswords = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private passwordService: PasswordService,
    private clipboardService: ClipboardService
  ) {}

  ngOnInit(): void {
    this.loadPasswordData();
  }

  loadPasswordData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.passwordService.getPassword(id).subscribe(password => {
        this.password = password;
        
        // Load password history
        if (password) {
          this.passwordService.getPasswordHistory(id).subscribe(history => {
            this.passwordHistory = history;
          });
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleHistoryPasswordVisibility(): void {
    this.hideHistoryPasswords = !this.hideHistoryPasswords;
  }

  copyUsername(): void {
    if (this.password) {
      this.clipboardService.copyToClipboard(this.password.username)
        .then(success => {
          if (success) {
            // Toast notification would go here in a real app
            console.log('Username copied to clipboard!');
          }
        });
    }
  }

  copyPassword(): void {
    if (this.password) {
      this.clipboardService.copyToClipboard(this.password.password, 30000)
        .then(success => {
          if (success) {
            // Update last used timestamp
            this.passwordService.markPasswordUsed(this.password!.id);
            this.password!.lastUsed = new Date();
            
            // Toast notification would go here in a real app
            console.log('Password copied to clipboard! Will clear in 30 seconds.');
          }
        });
    }
  }

  toggleFavorite(): void {
    if (this.password) {
      this.passwordService.updatePassword(this.password.id, {
        favorite: !this.password.favorite
      });
      
      // Update local state for immediate UI feedback
      this.password.favorite = !this.password.favorite;
    }
  }

  confirmDelete(): void {
    if (this.password) {
      // In a real app, this would show a confirmation dialog
      if (confirm('Are you sure you want to delete this password?')) {
        this.passwordService.deletePassword(this.password.id);
        this.router.navigate(['/passwords']);
      }
    }
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

  ensureHttpUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }

  // Password strength check functions
  hasUppercase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  hasLowercase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  hasNumbers(password: string): boolean {
    return /[0-9]/.test(password);
  }

  hasSymbols(password: string): boolean {
    return /[^A-Za-z0-9]/.test(password);
  }

  isLongEnough(password: string): boolean {
    return password.length >= 12;
  }
}