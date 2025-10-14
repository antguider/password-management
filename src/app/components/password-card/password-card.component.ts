import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Password } from '../../models/password.model';
import { ClipboardService } from '../../services/clipboard.service';
import { PasswordService } from '../../services/password.service';

@Component({
  selector: 'app-password-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatRippleModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <mat-card class="password-card" matRipple [routerLink]="['/passwords', password.id]">
      <div class="card-content">
        <div class="password-info">
          <div class="title-row">
            <h3 class="password-title">{{ password.title }}</h3>
            <mat-icon *ngIf="password.favorite" class="favorite-icon">star</mat-icon>
          </div>
          
          <p class="username">{{ password.username }}</p>
          
          <div class="password-meta">
            <div *ngIf="password.url" class="url-chip">
              <mat-icon class="mini-icon">link</mat-icon>
              <span class="url-text">{{ getDomainFromUrl(password.url) }}</span>
            </div>
            
          </div>
          
          <div class="strength-indicator">
            <mat-progress-bar 
              [color]="getStrengthColor(password.strength || 0)" 
              mode="determinate" 
              [value]="password.strength || 0">
            </mat-progress-bar>
            <span class="strength-label">{{ getStrengthLabel(password.strength || 0) }}</span>
          </div>
        </div>
        
        <div *ngIf="showActions" class="action-buttons" (click)="$event.stopPropagation()">
          <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More options">
            <mat-icon>more_vert</mat-icon>
          </button>
          
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="copyPassword()">
              <mat-icon>content_copy</mat-icon>
              <span>Copy Password</span>
            </button>
            <button mat-menu-item (click)="copyUsername()">
              <mat-icon>person</mat-icon>
              <span>Copy Username</span>
            </button>
            <button mat-menu-item [routerLink]="['/passwords', password.id, 'edit']">
              <mat-icon>edit</mat-icon>
              <span>Edit</span>
            </button>
            <button mat-menu-item (click)="toggleFavorite()">
              <mat-icon>{{ password.favorite ? 'star' : 'star_border' }}</mat-icon>
              <span>{{ password.favorite ? 'Remove from Favorites' : 'Add to Favorites' }}</span>
            </button>
            <button mat-menu-item (click)="confirmDelete()">
              <mat-icon>delete</mat-icon>
              <span>Delete</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .password-card {
      width: 100%;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .password-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .password-card:hover::before {
      transform: scaleX(1);
    }

    .password-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      padding: var(--space-6);
      align-items: flex-start;
    }

    .password-info {
      flex: 1;
      min-width: 0;
    }

    .title-row {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-2);
      gap: var(--space-2);
    }

    .password-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0;
      color: var(--text-primary);
      line-height: var(--line-height-tight);
      letter-spacing: var(--letter-spacing-tight);
    }

    .favorite-icon {
      color: var(--warning-500);
      font-size: var(--font-size-lg);
      height: var(--font-size-lg);
      width: var(--font-size-lg);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3));
    }

    .password-card:hover .favorite-icon {
      transform: scale(1.2) rotate(15deg);
      filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.5));
    }

    .username {
      color: var(--text-secondary);
      margin: var(--space-2) 0 var(--space-4);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      letter-spacing: var(--letter-spacing-normal);
    }

    .password-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .url-chip {
      display: inline-flex;
      align-items: center;
      background: var(--surface-glass);
      backdrop-filter: var(--glass-backdrop);
      -webkit-backdrop-filter: var(--glass-backdrop);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--text-secondary);
      border: 1px solid var(--glass-border);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: var(--letter-spacing-wide);
      text-transform: uppercase;
    }

    .url-chip:hover {
      background: var(--surface-elevated);
      transform: translateY(-2px) scale(1.05);
      border-color: var(--glass-border-strong);
      box-shadow: var(--shadow-md);
      color: var(--text-primary);
    }

    .mini-icon {
      font-size: 0.75rem;
      height: 0.75rem;
      width: 0.75rem;
      margin-right: var(--space-1);
    }

    .url-text {
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .strength-indicator {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-3);
      padding: var(--space-2);
      background: var(--gray-50);
      border-radius: var(--radius-md);
    }

    .strength-label {
      font-size: 0.75rem;
      min-width: 60px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .action-buttons {
      display: flex;
      align-items: flex-start;
      margin-left: var(--space-4);
    }

    .action-buttons button {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-lg);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .action-buttons button:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    @media (max-width: 768px) {
      .card-content {
        flex-direction: column;
        gap: var(--space-4);
      }
      
      .action-buttons {
        align-self: flex-end;
        margin-left: 0;
      }

      .password-meta {
        gap: var(--space-1);
      }

      .url-chip {
        font-size: 0.7rem;
        padding: var(--space-1) var(--space-2);
      }
    }

    @media (min-width: 1366px) and (max-width: 1920px) {
      .password-card {
        min-height: 140px;
      }

      .card-content {
        padding: var(--space-8);
      }

      .password-title {
        font-size: 1.25rem;
      }

      .username {
        font-size: 1rem;
      }
    }
  `]
})
export class PasswordCardComponent {
  @Input() password!: Password;
  @Input() showActions: boolean = true;
  @Output() deleted = new EventEmitter<string>();

  constructor(
    private clipboardService: ClipboardService,
    private passwordService: PasswordService
  ) {}

  getDomainFromUrl(url: string): string {
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch (error) {
      return url;
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

  copyPassword(): void {
    this.clipboardService.copyToClipboard(this.password.password, 30000)
      .then(success => {
        if (success) {
          // Update last used timestamp
          this.passwordService.markPasswordUsed(this.password.id);
          
          // Toast notification would go here in a real app
          console.log('Password copied to clipboard! Will clear in 30 seconds.');
        }
      });
  }

  copyUsername(): void {
    this.clipboardService.copyToClipboard(this.password.username)
      .then(success => {
        if (success) {
          // Toast notification would go here in a real app
          console.log('Username copied to clipboard!');
        }
      });
  }

  toggleFavorite(): void {
    this.passwordService.updatePassword(this.password.id, {
      favorite: !this.password.favorite
    });
    
    // Update local state for immediate UI feedback
    this.password.favorite = !this.password.favorite;
  }

  confirmDelete(): void {
    // In a real app, this would show a confirmation dialog
    if (confirm('Are you sure you want to delete this password?')) {
      this.passwordService.deletePassword(this.password.id);
      this.deleted.emit(this.password.id);
    }
  }
}