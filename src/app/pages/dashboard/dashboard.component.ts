import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PasswordService } from '../../services/password.service';
import { Password } from '../../models/password.model';
import { PasswordCardComponent } from '../../components/password-card/password-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    PasswordCardComponent
  ],
  template: `
    <div class="container slide-up">
      <div class="welcome-section">
        <h1>Welcome to Vault</h1>
        <p>Your secure password manager</p>
      </div>

      <div class="dashboard-grid">
        <mat-card class="dashboard-card stats-card slide-up stagger-1">
          <mat-card-header>
            <mat-card-title>Password Statistics</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-container">
              <div class="stat-item bounce-in stagger-1">
                <div class="stat-value">{{ passwordCount }}</div>
                <div class="stat-label">Total Passwords</div>
              </div>
              <div class="stat-item bounce-in stagger-2">
                <div class="stat-value">{{ favoriteCount }}</div>
                <div class="stat-label">Favorites</div>
              </div>
              <div class="stat-item bounce-in stagger-3">
                <div class="stat-value">{{ avgStrength }}%</div>
                <div class="stat-label">Avg. Strength</div>
              </div>
            </div>
            <mat-divider class="my-16"></mat-divider>
            <div class="strength-distribution">
              <h3>Strength Distribution</h3>
              <div class="strength-bars">
                <div class="strength-bar-item slide-in-left stagger-1">
                  <span class="strength-label">Weak</span>
                  <mat-progress-bar mode="determinate" color="warn" [value]="weakPercentage"></mat-progress-bar>
                  <span class="strength-value">{{ weakCount }}</span>
                </div>
                <div class="strength-bar-item slide-in-left stagger-2">
                  <span class="strength-label">Medium</span>
                  <mat-progress-bar mode="determinate" color="accent" [value]="mediumPercentage"></mat-progress-bar>
                  <span class="strength-value">{{ mediumCount }}</span>
                </div>
                <div class="strength-bar-item slide-in-left stagger-3">
                  <span class="strength-label">Strong</span>
                  <mat-progress-bar mode="determinate" color="primary" [value]="strongPercentage"></mat-progress-bar>
                  <span class="strength-value">{{ strongCount }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card actions-card slide-up stagger-2">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions">
              <a mat-raised-button color="primary" routerLink="/passwords/new" class="hover-lift click-ripple">
                <mat-icon>add</mat-icon>
                Add New Password
              </a>
              <a mat-raised-button color="accent" routerLink="/generator" class="hover-lift click-ripple">
                <mat-icon>shuffle</mat-icon>
                Generate Password
              </a>
              <a mat-raised-button color="warn" routerLink="/passwords" class="hover-lift click-ripple">
                <mat-icon>security</mat-icon>
                Check Passwords
              </a>
              <a mat-raised-button routerLink="/settings" class="hover-lift click-ripple">
                <mat-icon>settings</mat-icon>
                Settings
              </a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card recent-card slide-up stagger-3">
          <mat-card-header>
            <mat-card-title>Recently Updated</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentPasswords.length === 0" class="empty-state">
              <mat-icon>info</mat-icon>
              <p>No passwords yet. Add your first password to get started.</p>
            </div>
            <div *ngIf="recentPasswords.length > 0" class="recent-passwords">
              <app-password-card 
                *ngFor="let password of recentPasswords; let i = index" 
                [password]="password"
                [showActions]="false"
                [class]="'slide-in-right stagger-' + (i + 1)"
              ></app-password-card>
            </div>
            <div *ngIf="recentPasswords.length > 0" class="view-all-container">
              <a mat-button color="primary" routerLink="/passwords" class="hover-lift">
                View All Passwords
                <mat-icon>chevron_right</mat-icon>
              </a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card favorites-card slide-up stagger-4">
          <mat-card-header>
            <mat-card-title>Favorites</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="favoritePasswords.length === 0" class="empty-state">
              <mat-icon>star</mat-icon>
              <p>No favorites yet. Mark passwords as favorites for quick access.</p>
            </div>
            <div *ngIf="favoritePasswords.length > 0" class="favorite-passwords">
              <app-password-card 
                *ngFor="let password of favoritePasswords; let i = index" 
                [password]="password"
                [showActions]="false"
                [class]="'slide-in-left stagger-' + (i + 1)"
              ></app-password-card>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .welcome-section {
      text-align: center;
      margin-bottom: var(--space-12);
      padding: var(--space-8) 0;
    }

    .welcome-section h1 {
      font-size: var(--font-size-5xl);
      font-weight: var(--font-weight-black);
      margin-bottom: var(--space-6);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: var(--letter-spacing-tighter);
      line-height: var(--line-height-none);
      position: relative;
    }

    .welcome-section h1::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 4px;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
    }

    .welcome-section p {
      font-size: var(--font-size-xl);
      color: var(--text-secondary);
      font-weight: var(--font-weight-medium);
      letter-spacing: var(--letter-spacing-wide);
      max-width: 600px;
      margin: 0 auto;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-8);
      margin-top: var(--space-8);
    }

    .dashboard-card {
      height: 100%;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .dashboard-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .dashboard-card:hover::before {
      transform: scaleX(1);
    }

    .dashboard-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-2xl);
    }

    .stats-card, .actions-card {
      grid-column: span 1;
    }

    .recent-card, .favorites-card {
      grid-column: span 1;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
      margin: var(--space-8) 0;
      padding: var(--space-8);
      background: var(--surface-glass);
      backdrop-filter: var(--glass-backdrop);
      -webkit-backdrop-filter: var(--glass-backdrop);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
    }

    .stats-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--gradient-primary);
    }

    .stat-item {
      text-align: center;
      position: relative;
      padding: var(--space-4);
      background: var(--surface-elevated);
      border-radius: var(--radius-xl);
      border: 1px solid var(--glass-border);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stat-item:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: var(--shadow-xl);
      border-color: var(--glass-border-strong);
    }

    .stat-item::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-item:hover::after {
      opacity: 1;
    }

    .stat-value {
      font-size: var(--font-size-5xl);
      font-weight: var(--font-weight-black);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: var(--space-4);
      line-height: var(--line-height-none);
      letter-spacing: var(--letter-spacing-tighter);
      position: relative;
      display: block;
    }

    .stat-value::before {
      content: '';
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 2px;
      background: var(--gradient-secondary);
      border-radius: var(--radius-full);
    }

    .stat-label {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-widest);
      margin-top: var(--space-2);
      position: relative;
    }

    .stat-label::before {
      content: '';
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 1px;
      background: var(--gradient-secondary);
      border-radius: var(--radius-full);
    }

    .my-16 {
      margin: var(--space-6) 0;
    }

    .strength-distribution {
      margin-top: var(--space-8);
      padding: var(--space-6);
      background: var(--surface-glass);
      backdrop-filter: var(--glass-backdrop);
      -webkit-backdrop-filter: var(--glass-backdrop);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      position: relative;
    }

    .strength-distribution::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gradient-secondary);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }

    .strength-distribution h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-6);
      color: var(--text-primary);
      text-align: center;
      letter-spacing: var(--letter-spacing-tight);
      position: relative;
    }

    .strength-distribution h3::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: var(--gradient-secondary);
      border-radius: var(--radius-full);
    }

    .strength-bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .strength-bar-item {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--surface-elevated);
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .strength-bar-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gradient-primary);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .strength-bar-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--glass-border-strong);
    }

    .strength-bar-item:hover::before {
      opacity: 1;
    }

    .strength-label {
      width: 80px;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .strength-value {
      width: 50px;
      text-align: right;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-black);
      color: var(--text-accent);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    mat-progress-bar {
      flex-grow: 1;
      height: 12px;
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    mat-progress-bar ::ng-deep .mat-progress-bar-fill::after {
      background: var(--gradient-primary);
    }

    mat-progress-bar ::ng-deep .mat-progress-bar-buffer {
      background: var(--neutral-200);
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
      margin: var(--space-6) 0;
    }

    .quick-actions a {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-6);
      border-radius: var(--radius-lg);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .quick-actions a::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .quick-actions a:hover::before {
      left: 100%;
    }

    .quick-actions a:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .recent-passwords, .favorite-passwords {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      margin: var(--space-6) 0;
    }

    .view-all-container {
      display: flex;
      justify-content: center;
      margin-top: var(--space-6);
    }

    .view-all-container a {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
      background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
      color: var(--primary-700);
      text-decoration: none;
      border-radius: var(--radius-lg);
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid var(--primary-200);
    }

    .view-all-container a:hover {
      background: linear-gradient(135deg, var(--primary-100), var(--primary-200));
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) var(--space-6);
      color: var(--gray-500);
      text-align: center;
      background: var(--gray-50);
      border-radius: var(--radius-lg);
      border: 2px dashed var(--gray-300);
    }

    .empty-state mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      margin-bottom: var(--space-4);
      opacity: 0.6;
      color: var(--gray-400);
    }

    .empty-state p {
      font-size: 1rem;
      color: var(--gray-600);
      max-width: 300px;
    }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }

      .stats-card, .actions-card, .recent-card, .favorites-card {
        grid-column: span 1;
      }

      .welcome-section h1 {
        font-size: 2.5rem;
      }

      .welcome-section p {
        font-size: 1.125rem;
      }
    }

    @media (max-width: 768px) {
      .quick-actions {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }

      .stats-container {
        flex-direction: column;
        gap: var(--space-4);
        text-align: center;
      }

      .stat-item::after {
        display: none;
      }

      .welcome-section h1 {
        font-size: 2rem;
      }
    }

    @media (min-width: 1366px) and (max-width: 1920px) {
      .dashboard-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-8);
      }

      .stats-card {
        grid-column: span 1;
      }

      .actions-card {
        grid-column: span 2;
      }

      .recent-card, .favorites-card {
        grid-column: span 1;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  passwordCount = 0;
  favoriteCount = 0;
  avgStrength = 0;
  
  weakCount = 0;
  mediumCount = 0;
  strongCount = 0;
  
  weakPercentage = 0;
  mediumPercentage = 0;
  strongPercentage = 0;
  
  recentPasswords: Password[] = [];
  favoritePasswords: Password[] = [];

  constructor(private passwordService: PasswordService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.passwordService.getPasswords().subscribe(passwords => {
      this.passwordCount = passwords.length;
      
      // Get favorites
      this.favoritePasswords = passwords
        .filter(p => p.favorite)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 3);
      
      this.favoriteCount = this.favoritePasswords.length;
      
      // Get recent passwords
      this.recentPasswords = [...passwords]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 3);
      
      // Calculate strength stats
      if (this.passwordCount > 0) {
        const totalStrength = passwords.reduce((sum, p) => sum + (p.strength || 0), 0);
        this.avgStrength = Math.round(totalStrength / this.passwordCount);
        
        this.weakCount = passwords.filter(p => (p.strength || 0) < 50).length;
        this.mediumCount = passwords.filter(p => (p.strength || 0) >= 50 && (p.strength || 0) < 75).length;
        this.strongCount = passwords.filter(p => (p.strength || 0) >= 75).length;
        
        this.weakPercentage = (this.weakCount / this.passwordCount) * 100;
        this.mediumPercentage = (this.mediumCount / this.passwordCount) * 100;
        this.strongPercentage = (this.strongCount / this.passwordCount) * 100;
      }
    });
  }
}