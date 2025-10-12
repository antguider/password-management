import { Injectable, signal, computed } from '@angular/core';
import { 
  Auth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  
  // Signal-based state management
  private isAuthenticated = signal<boolean>(false);
  private currentUser = signal<User | null>(null);
  private isLoading = signal<boolean>(false);
  private isDemoMode = signal<boolean>(false);

  // Computed signals
  public isLoggedIn = computed(() => this.isAuthenticated() || this.isDemoMode());
  public user = computed(() => this.currentUser());
  public loading = computed(() => this.isLoading());
  public demoMode = computed(() => this.isDemoMode());

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Listen to authentication state changes
    try {
      onAuthStateChanged(this.auth, (user) => {
        this.isLoading.set(false);
        this.isAuthenticated.set(!!user);
        this.currentUser.set(user);
        this.userSubject.next(user);
      });
    } catch (error) {
      // Handle Firebase initialization errors gracefully
      console.warn('Firebase auth not properly initialized, demo mode available');
      this.isLoading.set(false);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<void> {
    try {
      this.isLoading.set(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(this.auth, provider);
      console.log('Google sign-in successful:', result.user);
      
      // Navigate to dashboard after successful login
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      this.isLoading.set(false);
      // If Firebase is not properly configured, suggest using demo mode
      if (error.code === 'auth/invalid-api-key') {
        throw new Error('Firebase not configured. Please use Demo Mode or set up Firebase credentials.');
      }
      throw error;
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      this.isLoading.set(true);
      await signOut(this.auth);
      console.log('Sign out successful');
      
      // Navigate to login page
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Sign out error:', error);
      this.isLoading.set(false);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    const user = this.currentUser();
    return user?.displayName || user?.email || 'User';
  }

  /**
   * Get user email
   */
  getUserEmail(): string {
    const user = this.currentUser();
    return user?.email || '';
  }

  /**
   * Get user photo URL
   */
  getUserPhotoUrl(): string {
    const user = this.currentUser();
    return user?.photoURL || '';
  }

  /**
   * Enable demo mode
   */
  enableDemoMode(): void {
    this.isDemoMode.set(true);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  /**
   * Disable demo mode
   */
  disableDemoMode(): void {
    this.isDemoMode.set(false);
  }

  /**
   * Check if in demo mode
   */
  isInDemoMode(): boolean {
    return this.isDemoMode();
  }
}
