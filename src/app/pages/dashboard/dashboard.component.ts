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
        <mat-card class="dashboard-card stats-card">
          <mat-card-header>
            <mat-card-title>Password Statistics</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-value">{{ passwordCount }}</div>
                <div class="stat-label">Total Passwords</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ favoriteCount }}</div>
                <div class="stat-label">Favorites</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ avgStrength }}%</div>
                <div class="stat-label">Avg. Strength</div>
              </div>
            </div>
            <mat-divider class="my-16"></mat-divider>
            <div class="strength-distribution">
              <h3>Strength Distribution</h3>
              <div class="strength-bars">
                <div class="strength-bar-item">
                  <span class="strength-label">Weak</span>
                  <mat-progress-bar mode="determinate" color="warn" [value]="weakPercentage"></mat-progress-bar>
                  <span class="strength-value">{{ weakCount }}</span>
                </div>
                <div class="strength-bar-item">
                  <span class="strength-label">Medium</span>
                  <mat-progress-bar mode="determinate" color="accent" [value]="mediumPercentage"></mat-progress-bar>
                  <span class="strength-value">{{ mediumCount }}</span>
                </div>
                <div class="strength-bar-item">
                  <span class="strength-label">Strong</span>
                  <mat-progress-bar mode="determinate" color="primary" [value]="strongPercentage"></mat-progress-bar>
                  <span class="strength-value">{{ strongCount }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card actions-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions">
              <a mat-raised-button color="primary" routerLink="/passwords/new">
                <mat-icon>add</mat-icon>
                Add New Password
              </a>
              <a mat-raised-button color="accent" routerLink="/generator">
                <mat-icon>shuffle</mat-icon>
                Generate Password
              </a>
              <a mat-raised-button color="warn" routerLink="/passwords">
                <mat-icon>security</mat-icon>
                Check Passwords
              </a>
              <a mat-raised-button routerLink="/settings">
                <mat-icon>settings</mat-icon>
                Settings
              </a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card recent-card">
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
                *ngFor="let password of recentPasswords" 
                [password]="password"
                [showActions]="false"
              ></app-password-card>
            </div>
            <div *ngIf="recentPasswords.length > 0" class="view-all-container">
              <a mat-button color="primary" routerLink="/passwords">
                View All Passwords
                <mat-icon>chevron_right</mat-icon>
              </a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card favorites-card">
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
                *ngFor="let password of favoritePasswords" 
                [password]="password"
                [showActions]="false"
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
      margin-bottom: 32px;
    }

    .welcome-section h1 {
      font-size: 32px;
      font-weight: 300;
      margin-bottom: 8px;
      color: #3F51B5;
    }

    .welcome-section p {
      font-size: 18px;
      color: #666;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .dashboard-card {
      height: 100%;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .stats-card, .actions-card {
      grid-column: span 1;
    }

    .recent-card, .favorites-card {
      grid-column: span 1;
    }

    .stats-container {
      display: flex;
      justify-content: space-around;
      margin: 16px 0;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 300;
      color: #3F51B5;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .my-16 {
      margin: 16px 0;
    }

    .strength-distribution {
      margin-top: 16px;
    }

    .strength-distribution h3 {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .strength-bars {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .strength-bar-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .strength-label {
      width: 60px;
      font-size: 14px;
    }

    .strength-value {
      width: 30px;
      text-align: right;
      font-size: 14px;
    }

    mat-progress-bar {
      flex-grow: 1;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 16px 0;
    }

    .recent-passwords, .favorite-passwords {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 16px 0;
    }

    .view-all-container {
      display: flex;
      justify-content: center;
      margin-top: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      color: #888;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    @media (max-width: 959px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .stats-card, .actions-card, .recent-card, .favorites-card {
        grid-column: span 1;
      }
    }

    @media (max-width: 599px) {
      .quick-actions {
        grid-template-columns: 1fr;
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