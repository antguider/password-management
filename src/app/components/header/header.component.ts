import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

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
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  showMobileMenu = false;

  // Computed properties for reactive user info
  isLoggedIn = computed(() => {
    const result = this.authService.isLoggedIn();
    console.log('Header isLoggedIn computed:', result);
    return result;
  });
  isDemoMode = computed(() => {
    const result = this.authService.isInDemoMode();
    console.log('Header isDemoMode computed:', result);
    return result;
  });
  userDisplayName = computed(() => {
    const result = this.authService.getUserDisplayName();
    console.log('Header userDisplayName computed:', result);
    return result;
  });
  userEmail = computed(() => {
    const result = this.authService.getUserEmail();
    console.log('Header userEmail computed:', result);
    return result;
  });
  userPhotoUrl = computed(() => {
    const result = this.authService.getUserPhotoUrl();
    console.log('Header userPhotoUrl computed:', result);
    return result;
  });

  constructor(
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.snackBar.open('Successfully signed out', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    } catch (error) {
      console.error('Logout error:', error);
      this.snackBar.open('Failed to sign out', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  exitDemo() {
    this.authService.disableDemoMode();
    this.router.navigate(['/login']);
    this.snackBar.open('Exited demo mode', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}