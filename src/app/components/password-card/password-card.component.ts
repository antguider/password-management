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
            
            <div *ngIf="password.category" class="category-chip">
              <mat-icon class="mini-icon">folder</mat-icon>
              <span>{{ password.category }}</span>
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
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .password-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
    }

    .password-info {
      flex: 1;
    }

    .title-row {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }

    .password-title {
      font-size: 18px;
      font-weight: 500;
      margin: 0;
      color: #333;
    }

    .favorite-icon {
      color: #FFC107;
      margin-left: 8px;
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    .username {
      color: #666;
      margin: 4px 0 8px;
      font-size: 14px;
    }

    .password-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .url-chip, .category-chip {
      display: flex;
      align-items: center;
      background-color: #f0f0f0;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
    }

    .mini-icon {
      font-size: 12px;
      height: 12px;
      width: 12px;
      margin-right: 4px;
    }

    .url-text {
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .strength-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }

    .strength-label {
      font-size: 12px;
      min-width: 50px;
    }

    .action-buttons {
      display: flex;
      align-items: flex-start;
    }

    @media (max-width: 599px) {
      .card-content {
        flex-direction: column;
      }
      
      .action-buttons {
        align-self: flex-end;
        margin-top: 8px;
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