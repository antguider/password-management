import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Password, PasswordFilter, Category, PasswordHistory } from '../models/password.model';
import { StorageService } from './storage.service';
import { EncryptionService } from './encryption.service';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordService implements OnDestroy {
  private passwords = signal<Password[]>([]);
  private categories = signal<Category[]>([]);
  private passwordHistory = signal<PasswordHistory[]>([]);
  private currentFilter = signal<PasswordFilter>({
    sortBy: 'updatedAt',
    sortDirection: 'desc'
  });

  private firestoreSubscription: Subscription | null = null;
  private isInitialized = false;

  // Computed signals
  public passwordsList = computed(() => this.passwords());
  public categoriesList = computed(() => this.categories());
  public passwordHistoryList = computed(() => this.passwordHistory());

  constructor(
    private storageService: StorageService,
    private encryptionService: EncryptionService,
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {
    this.initializeService();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initializeService(): void {
    // Listen to authentication state changes
    this.authService.user$.subscribe(user => {
      if (user && !this.isInitialized) {
        this.initializeUserData(user.uid);
        this.isInitialized = true;
      } else if (!user && this.isInitialized) {
        this.cleanup();
        this.isInitialized = false;
      }
    });

    // Check demo mode state
    this.checkDemoMode();
  }

  private checkDemoMode(): void {
    const isDemo = this.authService.isInDemoMode();
    if (isDemo && !this.isInitialized) {
      this.initializeDemoMode();
      this.isInitialized = true;
    } else if (!isDemo && this.isInitialized) {
      this.cleanup();
      this.isInitialized = false;
    }
  }

  private initializeUserData(userId: string): void {
    // Initialize Firestore listeners
    this.firestoreService.initializeUserData(userId);

    // Subscribe to Firestore data
    this.firestoreSubscription = this.firestoreService.passwords$.subscribe(passwords => {
      this.passwords.set(passwords);
    });

    this.firestoreService.categories$.subscribe(categories => {
      this.categories.set(categories);
    });

    this.firestoreService.passwordHistory$.subscribe(history => {
      this.passwordHistory.set(history);
    });

    // Initialize default categories if user is new
    this.initializeDefaultCategoriesIfNeeded(userId);
  }

  private initializeDemoMode(): void {
    // For demo mode, use localStorage
    this.loadPasswordsFromStorage();
    this.loadCategoriesFromStorage();
    this.loadPasswordHistoryFromStorage();
  }

  private async initializeDefaultCategoriesIfNeeded(userId: string): Promise<void> {
    const categories = this.categories();
    if (categories.length === 0) {
      await this.firestoreService.initializeDefaultCategories(userId);
    }
  }

  private loadPasswordsFromStorage(): void {
    const storedPasswords = this.storageService.getItem('passwords');
    if (storedPasswords) {
      try {
        const decryptedPasswords = this.encryptionService.decryptData(storedPasswords);
        this.passwords.set(JSON.parse(decryptedPasswords));
      } catch (error) {
        console.error('Failed to load passwords from storage', error);
        this.passwords.set([]);
      }
    }
  }

  private loadCategoriesFromStorage(): void {
    const storedCategories = this.storageService.getItem('categories');
    if (storedCategories) {
      try {
        const decryptedCategories = this.encryptionService.decryptData(storedCategories);
        this.categories.set(JSON.parse(decryptedCategories));
      } catch (error) {
        console.error('Failed to load categories from storage', error);
        // Set default categories for demo mode
        this.categories.set([
          { id: '1', name: 'Personal', color: '#4CAF50', icon: 'person' },
          { id: '2', name: 'Work', color: '#2196F3', icon: 'work' },
          { id: '3', name: 'Finance', color: '#FF9800', icon: 'account_balance' },
          { id: '4', name: 'Shopping', color: '#E91E63', icon: 'shopping_cart' },
          { id: '5', name: 'Social', color: '#9C27B0', icon: 'group' },
        ]);
      }
    } else {
      // Set default categories for demo mode
      this.categories.set([
        { id: '1', name: 'Personal', color: '#4CAF50', icon: 'person' },
        { id: '2', name: 'Work', color: '#2196F3', icon: 'work' },
        { id: '3', name: 'Finance', color: '#FF9800', icon: 'account_balance' },
        { id: '4', name: 'Shopping', color: '#E91E63', icon: 'shopping_cart' },
        { id: '5', name: 'Social', color: '#9C27B0', icon: 'group' },
      ]);
    }
  }

  private loadPasswordHistoryFromStorage(): void {
    const storedHistory = this.storageService.getItem('passwordHistory');
    if (storedHistory) {
      try {
        const decryptedHistory = this.encryptionService.decryptData(storedHistory);
        this.passwordHistory.set(JSON.parse(decryptedHistory));
      } catch (error) {
        console.error('Failed to load password history from storage', error);
        this.passwordHistory.set([]);
      }
    }
  }

  private savePasswordsToStorage(): void {
    const encryptedPasswords = this.encryptionService.encryptData(
      JSON.stringify(this.passwords())
    );
    this.storageService.setItem('passwords', encryptedPasswords);
  }

  private saveCategoriesToStorage(): void {
    const encryptedCategories = this.encryptionService.encryptData(
      JSON.stringify(this.categories())
    );
    this.storageService.setItem('categories', encryptedCategories);
  }

  private savePasswordHistoryToStorage(): void {
    const encryptedHistory = this.encryptionService.encryptData(
      JSON.stringify(this.passwordHistory())
    );
    this.storageService.setItem('passwordHistory', encryptedHistory);
  }

  getPasswords(): Observable<Password[]> {
    return of(this.passwords()).pipe(
      map(passwords => this.applyFilter(passwords, this.currentFilter()))
    );
  }

  getPassword(id: string): Observable<Password | undefined> {
    return of(this.passwords().find(p => p.id === id));
  }

  getCategories(): Observable<Category[]> {
    return of(this.categories());
  }

  getPasswordHistory(passwordId: string): Observable<PasswordHistory[]> {
    return of(this.passwordHistory().filter(h => h.passwordId === passwordId));
  }

  async addPassword(password: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    console.log('Adding password:', password);
    console.log('Is demo mode:', this.authService.isInDemoMode());
    
    const newPassword: Password = {
      ...password,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      strength: this.calculatePasswordStrength(password.password)
    };

    if (this.authService.isInDemoMode()) {
      // Demo mode - use localStorage
      console.log('Saving to localStorage (demo mode)');
      this.passwords.update(current => [...current, newPassword]);
      this.savePasswordsToStorage();
    } else {
      // Authenticated mode - use Firestore
      const user = this.authService.getCurrentUser();
      console.log('Current user:', user);
      if (user) {
        console.log('Saving to Firestore for user:', user.uid);
        await this.firestoreService.addPassword(user.uid, newPassword);
        console.log('Password saved to Firestore successfully');
      } else {
        console.error('No authenticated user found');
        throw new Error('No authenticated user found');
      }
    }
  }

  async updatePassword(id: string, password: Partial<Password>): Promise<void> {
    const existingPassword = this.passwords().find(p => p.id === id);
    
    if (existingPassword && password.password && password.password !== existingPassword.password) {
      // Save old password to history
      const historyEntry: PasswordHistory = {
        id: crypto.randomUUID(),
        passwordId: id,
        oldPassword: existingPassword.password,
        changedAt: new Date()
      };
      
      if (this.authService.isInDemoMode()) {
        // Demo mode - use localStorage
        this.passwordHistory.update(current => [...current, historyEntry]);
        this.savePasswordHistoryToStorage();
      } else {
        // Authenticated mode - use Firestore
        const user = this.authService.getCurrentUser();
        if (user) {
          await this.firestoreService.addPasswordHistory(user.uid, historyEntry);
        }
      }
    }

    if (this.authService.isInDemoMode()) {
      // Demo mode - use localStorage
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
      // Authenticated mode - use Firestore
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
      // Demo mode - use localStorage
      this.passwords.update(current => current.filter(p => p.id !== id));
      this.savePasswordsToStorage();
    } else {
      // Authenticated mode - use Firestore
      const user = this.authService.getCurrentUser();
      if (user) {
        await this.firestoreService.deletePassword(user.uid, id);
      }
    }
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<void> {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID()
    };

    if (this.authService.isInDemoMode()) {
      // Demo mode - use localStorage
      this.categories.update(current => [...current, newCategory]);
      this.saveCategoriesToStorage();
    } else {
      // Authenticated mode - use Firestore
      const user = this.authService.getCurrentUser();
      if (user) {
        await this.firestoreService.addCategory(user.uid, newCategory);
      }
    }
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<void> {
    if (this.authService.isInDemoMode()) {
      // Demo mode - use localStorage
      this.categories.update(current => 
        current.map(c => c.id === id ? { ...c, ...category } : c)
      );
      this.saveCategoriesToStorage();
    } else {
      // Authenticated mode - use Firestore
      const user = this.authService.getCurrentUser();
      if (user) {
        await this.firestoreService.updateCategory(user.uid, id, category);
      }
    }
  }

  async deleteCategory(id: string): Promise<void> {
    if (this.authService.isInDemoMode()) {
      // Demo mode - use localStorage
      this.categories.update(current => current.filter(c => c.id !== id));
      this.saveCategoriesToStorage();
    } else {
      // Authenticated mode - use Firestore
      const user = this.authService.getCurrentUser();
      if (user) {
        await this.firestoreService.deleteCategory(user.uid, id);
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

    if (filter.category) {
      filtered = filtered.filter(p => p.category === filter.category);
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
    // Simple password strength calculation (0-100)
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

  private cleanup(): void {
    if (this.firestoreSubscription) {
      this.firestoreSubscription.unsubscribe();
      this.firestoreSubscription = null;
    }
    this.firestoreService.clearUserData();
    this.passwords.set([]);
    this.categories.set([]);
    this.passwordHistory.set([]);
  }
}