import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary" class="header">
      <div class="container header-container">
        <div class="logo-container">
          <a [routerLink]="['/dashboard']" class="logo">
            <mat-icon>lock</mat-icon>
            <span>Vault</span>
          </a>
        </div>

        <div class="nav-links" [class.show-mobile-menu]="showMobileMenu">
          <a mat-button 
            routerLink="/dashboard" 
            routerLinkActive="active-link">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-button 
            routerLink="/passwords" 
            routerLinkActive="active-link">
            <mat-icon>vpn_key</mat-icon>
            <span>Passwords</span>
          </a>
          <a mat-button 
            routerLink="/generator" 
            routerLinkActive="active-link">
            <mat-icon>shuffle</mat-icon>
            <span>Generator</span>
          </a>
          <a mat-button 
            routerLink="/settings" 
            routerLinkActive="active-link">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </a>
        </div>

        <button mat-icon-button class="menu-button" (click)="toggleMobileMenu()">
          <mat-icon>{{ showMobileMenu ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .logo-container {
      display: flex;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: white;
      font-weight: 500;
    }

    .logo mat-icon {
      margin-right: 8px;
    }

    .nav-links {
      display: flex;
      align-items: center;
    }

    .nav-links a {
      margin: 0 4px;
      display: flex;
      align-items: center;
    }

    .nav-links a mat-icon {
      margin-right: 4px;
    }

    .active-link {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .menu-button {
      display: none;
    }

    @media (max-width: 768px) {
      .nav-links {
        position: fixed;
        top: 64px;
        left: 0;
        right: 0;
        background-color: #3F51B5;
        flex-direction: column;
        align-items: flex-start;
        padding: 16px;
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .nav-links a {
        width: 100%;
        padding: 12px 0;
        margin: 0;
      }

      .show-mobile-menu {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .menu-button {
        display: block;
      }
    }
  `]
})
export class HeaderComponent {
  showMobileMenu = false;

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }
}