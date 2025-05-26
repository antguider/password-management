import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Password, PasswordFilter, Category, PasswordHistory } from '../models/password.model';
import { StorageService } from './storage.service';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private passwords = signal<Password[]>([]);
  private categories = signal<Category[]>([
    { id: '1', name: 'Personal', color: '#4CAF50', icon: 'person' },
    { id: '2', name: 'Work', color: '#2196F3', icon: 'work' },
    { id: '3', name: 'Finance', color: '#FF9800', icon: 'account_balance' },
    { id: '4', name: 'Shopping', color: '#E91E63', icon: 'shopping_cart' },
    { id: '5', name: 'Social', color: '#9C27B0', icon: 'group' },
  ]);
  private passwordHistory = signal<PasswordHistory[]>([]);

  private currentFilter = signal<PasswordFilter>({
    sortBy: 'updatedAt',
    sortDirection: 'desc'
  });

  constructor(
    private storageService: StorageService,
    private encryptionService: EncryptionService
  ) {
    this.loadPasswords();
    this.loadCategories();
    this.loadPasswordHistory();
  }

  private loadPasswords(): void {
    const storedPasswords = this.storageService.getItem('passwords');
    if (storedPasswords) {
      try {
        const decryptedPasswords = this.encryptionService.decryptData(storedPasswords);
        this.passwords.set(JSON.parse(decryptedPasswords));
      } catch (error) {
        console.error('Failed to load passwords', error);
        this.passwords.set([]);
      }
    }
  }

  private loadCategories(): void {
    const storedCategories = this.storageService.getItem('categories');
    if (storedCategories) {
      try {
        const decryptedCategories = this.encryptionService.decryptData(storedCategories);
        this.categories.set(JSON.parse(decryptedCategories));
      } catch (error) {
        console.error('Failed to load categories', error);
        // Keep default categories
      }
    }
  }

  private loadPasswordHistory(): void {
    const storedHistory = this.storageService.getItem('passwordHistory');
    if (storedHistory) {
      try {
        const decryptedHistory = this.encryptionService.decryptData(storedHistory);
        this.passwordHistory.set(JSON.parse(decryptedHistory));
      } catch (error) {
        console.error('Failed to load password history', error);
        this.passwordHistory.set([]);
      }
    }
  }

  private savePasswords(): void {
    const encryptedPasswords = this.encryptionService.encryptData(
      JSON.stringify(this.passwords())
    );
    this.storageService.setItem('passwords', encryptedPasswords);
  }

  private saveCategories(): void {
    const encryptedCategories = this.encryptionService.encryptData(
      JSON.stringify(this.categories())
    );
    this.storageService.setItem('categories', encryptedCategories);
  }

  private savePasswordHistory(): void {
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

  addPassword(password: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newPassword: Password = {
      ...password,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      strength: this.calculatePasswordStrength(password.password)
    };

    this.passwords.update(current => [...current, newPassword]);
    this.savePasswords();
  }

  updatePassword(id: string, password: Partial<Password>): void {
    const existingPassword = this.passwords().find(p => p.id === id);
    
    if (existingPassword && password.password && password.password !== existingPassword.password) {
      // Save old password to history
      const historyEntry: PasswordHistory = {
        id: crypto.randomUUID(),
        passwordId: id,
        oldPassword: existingPassword.password,
        changedAt: new Date()
      };
      
      this.passwordHistory.update(current => [...current, historyEntry]);
      this.savePasswordHistory();
    }

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
    
    this.savePasswords();
  }

  deletePassword(id: string): void {
    this.passwords.update(current => current.filter(p => p.id !== id));
    this.savePasswords();
  }

  addCategory(category: Omit<Category, 'id'>): void {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID()
    };

    this.categories.update(current => [...current, newCategory]);
    this.saveCategories();
  }

  updateCategory(id: string, category: Partial<Category>): void {
    this.categories.update(current => 
      current.map(c => c.id === id ? { ...c, ...category } : c)
    );
    this.saveCategories();
  }

  deleteCategory(id: string): void {
    this.categories.update(current => current.filter(c => c.id !== id));
    this.saveCategories();
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
}