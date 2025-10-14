import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Password, PasswordFilter, PasswordHistory } from '../models/password.model';
import { StorageService } from './storage.service';
import { EncryptionService } from './encryption.service';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordService implements OnDestroy {
  // Single source of truth - using signals only
  private passwords = signal<Password[]>([]);
  private passwordHistory = signal<PasswordHistory[]>([]);
  private currentFilter = signal<PasswordFilter>({
    sortBy: 'updatedAt',
    sortDirection: 'desc'
  });

  // In-memory storage for incognito mode fallback
  private inMemoryPasswords: Password[] = [];
  private inMemoryPasswordHistory: PasswordHistory[] = [];

  // Computed signals for reactive updates
  public passwordsList = computed(() => this.passwords());
  public passwordHistoryList = computed(() => this.passwordHistory());

  // Filtered passwords computed signal
  public filteredPasswords = computed(() => {
    const passwords = this.passwords();
    const filter = this.currentFilter();
    return this.applyFilter(passwords, filter);
  });

  private isInitialized = false;
  private destroy$ = new BehaviorSubject<boolean>(false);

  constructor(
    private storageService: StorageService,
    private encryptionService: EncryptionService,
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {
    this.initializeService();
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private initializeService(): void {
    // Listen to authentication state changes
    this.authService.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user && !this.isInitialized) {
        // User logged in - clear demo data and load from Firestore
        this.cleanup();
        this.initializeUserData(user.uid);
        this.isInitialized = true;
      } else if (!user && this.isInitialized) {
        // User logged out - cleanup and switch to demo mode
        this.cleanup();
        this.isInitialized = false;
        this.authService.enableDemoMode();
        this.checkDemoMode();
      }
    });

    // Check demo mode or initialize with sample data
    this.checkDemoMode();
    
    // If not authenticated and not in demo mode, enable demo mode automatically
    setTimeout(() => {
      if (!this.authService.isLoggedIn() && !this.isInitialized) {
        this.authService.enableDemoMode();
        this.checkDemoMode();
      }
    }, 1000); // Small delay to ensure auth state is settled
  }

  private checkDemoMode(): void {
    const isDemo = this.authService.isInDemoMode();
    if (isDemo && !this.isInitialized) {
      this.initializeDemoMode();
      this.isInitialized = true;
    }
  }

  private initializeUserData(userId: string): void {
    // Initialize Firestore listeners
    this.firestoreService.initializeUserData(userId);

    // Subscribe to Firestore data with proper cleanup
    this.firestoreService.passwords$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(passwords => {
      console.log('Loading passwords from Firestore:', passwords.length);
      this.passwords.set(passwords);
    });

    this.firestoreService.passwordHistory$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(history => {
      this.passwordHistory.set(history);
    });
  }

  private initializeDemoMode(): void {
    this.loadPasswordsFromStorage();
    this.loadPasswordHistoryFromStorage();
    
    // If no passwords in storage, create some sample passwords
    if (this.passwords().length === 0) {
      this.createSamplePasswords();
    }
  }


  private loadPasswordsFromStorage(): void {
    const storedPasswords = this.storageService.getItem('passwords');
    if (storedPasswords) {
      try {
        const decryptedPasswords = this.encryptionService.decryptData(storedPasswords);
        const passwords = JSON.parse(decryptedPasswords);
        this.passwords.set(passwords);
        // Also store in memory for incognito mode fallback
        this.inMemoryPasswords = [...passwords];
      } catch (error) {
        console.error('Failed to load passwords from storage', error);
        this.passwords.set([]);
      }
    } else {
      // Check if we have in-memory passwords (for incognito mode)
      if (this.inMemoryPasswords.length > 0) {
        this.passwords.set([...this.inMemoryPasswords]);
      } else {
        this.passwords.set([]);
      }
    }
  }


  private loadPasswordHistoryFromStorage(): void {
    const storedHistory = this.storageService.getItem('passwordHistory');
    if (storedHistory) {
      try {
        const decryptedHistory = this.encryptionService.decryptData(storedHistory);
        const history = JSON.parse(decryptedHistory);
        this.passwordHistory.set(history);
        // Also store in memory for incognito mode fallback
        this.inMemoryPasswordHistory = [...history];
      } catch (error) {
        console.error('Failed to load password history from storage', error);
        this.passwordHistory.set([]);
      }
    } else {
      // Check if we have in-memory history (for incognito mode)
      if (this.inMemoryPasswordHistory.length > 0) {
        this.passwordHistory.set([...this.inMemoryPasswordHistory]);
      } else {
        this.passwordHistory.set([]);
      }
    }
  }

  private savePasswordsToStorage(): void {
    const passwords = this.passwords();
    const encryptedPasswords = this.encryptionService.encryptData(
      JSON.stringify(passwords)
    );
    this.storageService.setItem('passwords', encryptedPasswords);
    // Also update in-memory storage for incognito mode fallback
    this.inMemoryPasswords = [...passwords];
  }


  private savePasswordHistoryToStorage(): void {
    const history = this.passwordHistory();
    const encryptedHistory = this.encryptionService.encryptData(
      JSON.stringify(history)
    );
    this.storageService.setItem('passwordHistory', encryptedHistory);
    // Also update in-memory storage for incognito mode fallback
    this.inMemoryPasswordHistory = [...history];
  }

  // Public API methods
  getPasswords(): Observable<Password[]> {
    return of(this.filteredPasswords());
  }

  getRawPasswords(): Observable<Password[]> {
    return of(this.passwords());
  }

  getPassword(id: string): Observable<Password | undefined> {
    return of(this.passwords().find(p => p.id === id));
  }


  getPasswordHistory(passwordId: string): Observable<PasswordHistory[]> {
    return of(this.passwordHistory().filter(h => h.passwordId === passwordId));
  }

  async addPassword(password: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const newPassword: Password = {
      ...password,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      strength: this.calculatePasswordStrength(password.password)
    };

    if (this.authService.isInDemoMode()) {
      this.passwords.update(current => [...current, newPassword]);
      this.savePasswordsToStorage();
    } else {
      const user = this.authService.getCurrentUser();
      if (user) {
        await this.firestoreService.addPassword(user.uid, newPassword);
      } else {
        throw new Error('No authenticated user found');
      }
    }
  }

  async updatePassword(id: string, password: Partial<Password>): Promise<void> {
    const existingPassword = this.passwords().find(p => p.id === id);
    
    if (existingPassword && password.password && password.password !== existingPassword.password) {
      const historyEntry: PasswordHistory = {
        id: crypto.randomUUID(),
        passwordId: id,
        oldPassword: existingPassword.password,
        changedAt: new Date()
      };
      
      if (this.authService.isInDemoMode()) {
        this.passwordHistory.update(current => [...current, historyEntry]);
        this.savePasswordHistoryToStorage();
      } else {
        const user = this.authService.getCurrentUser();
        if (user) {
          await this.firestoreService.addPasswordHistory(user.uid, historyEntry);
        }
      }
    }

    if (this.authService.isInDemoMode()) {
      this.passwords.update(current => 
        current.map(p => p.id === id ? { 
          ...p, 
          ...password, 
          updatedAt: new Date(),
          strength: password.password ? 
            this.calculatePasswordStrength(password.password) : 
            p.strength
        } : p)
      );
      this.savePasswordsToStorage();
    } else {
      const user = this.authService.getCurrentUser();
      if (user) {
        const updates = {
          ...password,
          strength: password.password ? 
            this.calculatePasswordStrength(password.password) : 
            existingPassword?.strength
        };
        await this.firestoreService.updatePassword(user.uid, id, updates);
      }
    }
  }

  async deletePassword(id: string): Promise<void> {
    if (this.authService.isInDemoMode()) {
      this.passwords.update(current => current.filter(p => p.id !== id));
      this.savePasswordsToStorage();
    } else {
      const user = this.authService.getCurrentUser();
      if (user) {
        await this.firestoreService.deletePassword(user.uid, id);
      }
    }
  }


  setFilter(filter: PasswordFilter): void {
    this.currentFilter.set({ ...this.currentFilter(), ...filter });
  }

  resetFilter(): void {
    this.currentFilter.set({
      sortBy: 'updatedAt',
      sortDirection: 'desc'
    });
  }

  private applyFilter(passwords: Password[], filter: PasswordFilter): Password[] {
    let filtered = [...passwords];

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.username.toLowerCase().includes(term) || 
        (p.url && p.url.toLowerCase().includes(term)) ||
        (p.notes && p.notes.toLowerCase().includes(term))
      );
    }


    if (filter.favorite !== undefined) {
      filtered = filtered.filter(p => p.favorite === filter.favorite);
    }

    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const valueA = a[filter.sortBy as keyof Password];
        const valueB = b[filter.sortBy as keyof Password];
        
        if (valueA === undefined || valueB === undefined) return 0;
        
        if (valueA instanceof Date && valueB instanceof Date) {
          return filter.sortDirection === 'asc' 
            ? valueA.getTime() - valueB.getTime() 
            : valueB.getTime() - valueA.getTime();
        }
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return filter.sortDirection === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        }
        
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return filter.sortDirection === 'asc' 
            ? valueA - valueB 
            : valueB - valueA;
        }
        
        return 0;
      });
    }

    return filtered;
  }

  calculatePasswordStrength(password: string): number {
    let score = 0;
    
    // Length
    score += Math.min(password.length * 4, 40);
    
    // Character variety
    if (/[A-Z]/.test(password)) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    // Complexity patterns
    if (/([a-zA-Z0-9].*){3,}/.test(password)) score += 5;
    if (/([^A-Za-z0-9].*){2,}/.test(password)) score += 5;
    
    // Penalize repeating characters and patterns
    const repeats = password.match(/(.)\1+/g);
    if (repeats) score -= repeats.length * 2;
    
    return Math.max(0, Math.min(100, score));
  }

  markPasswordUsed(id: string): void {
    this.updatePassword(id, { lastUsed: new Date() });
  }


  private createSamplePasswords(): void {
    const samplePasswords: Password[] = [
      {
        id: crypto.randomUUID(),
        title: 'Gmail',
        username: 'user@gmail.com',
        password: 'MySecurePassword123!',
        url: 'https://gmail.com',
        notes: 'Personal email account',
        favorite: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        strength: 85
      },
      {
        id: crypto.randomUUID(),
        title: 'Facebook',
        username: 'john.doe',
        password: 'FbSecure2024!',
        url: 'https://facebook.com',
        notes: 'Social media account',
        favorite: false,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        strength: 78
      },
      {
        id: crypto.randomUUID(),
        title: 'Bank Account',
        username: 'john.doe@email.com',
        password: 'BankPass2024#',
        url: 'https://mybank.com',
        notes: 'Primary checking account',
        favorite: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        strength: 92
      },
      {
        id: crypto.randomUUID(),
        title: 'Netflix',
        username: 'john.doe@email.com',
        password: 'Netflix2024!',
        url: 'https://netflix.com',
        notes: 'Streaming service subscription',
        favorite: false,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        strength: 70
      },
      {
        id: crypto.randomUUID(),
        title: 'GitHub',
        username: 'johndoe',
        password: 'GitHubDev2024!',
        url: 'https://github.com',
        notes: 'Code repository and development',
        favorite: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        strength: 88
      }
    ];

    this.passwords.set(samplePasswords);
    this.inMemoryPasswords = [...samplePasswords];
    this.savePasswordsToStorage();
  }

  private cleanup(): void {
    this.firestoreService.clearUserData();
    this.passwords.set([]);
    this.passwordHistory.set([]);
    this.inMemoryPasswords = [];
    this.inMemoryPasswordHistory = [];
  }
}