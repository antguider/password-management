import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Password, Category, PasswordHistory } from '../models/password.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private passwordsSubject = new BehaviorSubject<Password[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private passwordHistorySubject = new BehaviorSubject<PasswordHistory[]>([]);

  public passwords$ = this.passwordsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public passwordHistory$ = this.passwordHistorySubject.asObservable();

  private passwordsUnsubscribe: Unsubscribe | null = null;
  private categoriesUnsubscribe: Unsubscribe | null = null;
  private passwordHistoryUnsubscribe: Unsubscribe | null = null;

  constructor(private firestore: Firestore) {}

  /**
   * Initialize real-time listeners for user data
   */
  initializeUserData(userId: string): void {
    this.cleanupListeners();
    
    // Listen to passwords
    const passwordsRef = collection(this.firestore, 'users', userId, 'passwords');
    this.passwordsUnsubscribe = onSnapshot(
      query(passwordsRef, orderBy('updatedAt', 'desc')),
      (snapshot) => {
        const passwords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Password[];
        this.passwordsSubject.next(passwords);
      },
      (error) => {
        console.error('Error listening to passwords:', error);
      }
    );

    // Listen to categories
    const categoriesRef = collection(this.firestore, 'users', userId, 'categories');
    this.categoriesUnsubscribe = onSnapshot(
      categoriesRef,
      (snapshot) => {
        const categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        this.categoriesSubject.next(categories);
      },
      (error) => {
        console.error('Error listening to categories:', error);
      }
    );

    // Listen to password history
    const historyRef = collection(this.firestore, 'users', userId, 'passwordHistory');
    this.passwordHistoryUnsubscribe = onSnapshot(
      query(historyRef, orderBy('changedAt', 'desc')),
      (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PasswordHistory[];
        this.passwordHistorySubject.next(history);
      },
      (error) => {
        console.error('Error listening to password history:', error);
      }
    );
  }

  /**
   * Add a new password
   */
  async addPassword(userId: string, password: Omit<Password, 'id'>): Promise<string> {
    const passwordsRef = collection(this.firestore, 'users', userId, 'passwords');
    const docRef = await addDoc(passwordsRef, {
      ...password,
      createdAt: password.createdAt || new Date(),
      updatedAt: password.updatedAt || new Date()
    });
    return docRef.id;
  }

  /**
   * Update an existing password
   */
  async updatePassword(userId: string, passwordId: string, updates: Partial<Password>): Promise<void> {
    const passwordRef = doc(this.firestore, 'users', userId, 'passwords', passwordId);
    await updateDoc(passwordRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  /**
   * Delete a password
   */
  async deletePassword(userId: string, passwordId: string): Promise<void> {
    const passwordRef = doc(this.firestore, 'users', userId, 'passwords', passwordId);
    await deleteDoc(passwordRef);
  }

  /**
   * Add a new category
   */
  async addCategory(userId: string, category: Omit<Category, 'id'>): Promise<string> {
    const categoriesRef = collection(this.firestore, 'users', userId, 'categories');
    const docRef = await addDoc(categoriesRef, category);
    return docRef.id;
  }

  /**
   * Update an existing category
   */
  async updateCategory(userId: string, categoryId: string, updates: Partial<Category>): Promise<void> {
    const categoryRef = doc(this.firestore, 'users', userId, 'categories', categoryId);
    await updateDoc(categoryRef, updates);
  }

  /**
   * Delete a category
   */
  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const categoryRef = doc(this.firestore, 'users', userId, 'categories', categoryId);
    await deleteDoc(categoryRef);
  }

  /**
   * Add password history entry
   */
  async addPasswordHistory(userId: string, historyEntry: Omit<PasswordHistory, 'id'>): Promise<string> {
    const historyRef = collection(this.firestore, 'users', userId, 'passwordHistory');
    const docRef = await addDoc(historyRef, {
      ...historyEntry,
      changedAt: historyEntry.changedAt || new Date()
    });
    return docRef.id;
  }

  /**
   * Get passwords with filtering
   */
  async getPasswords(userId: string, filters?: {
    searchTerm?: string;
    category?: string;
    favorite?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<Password[]> {
    const passwordsRef = collection(this.firestore, 'users', userId, 'passwords');
    let q = query(passwordsRef);

    // Apply filters
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.favorite !== undefined) {
      q = query(q, where('favorite', '==', filters.favorite));
    }

    // Apply sorting
    const sortField = filters?.sortBy || 'updatedAt';
    const sortDirection = filters?.sortDirection || 'desc';
    q = query(q, orderBy(sortField, sortDirection));

    const snapshot = await getDocs(q);
    let passwords = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Password[];

    // Apply search filter (client-side for text search)
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      passwords = passwords.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.username.toLowerCase().includes(searchTerm) ||
        (p.url && p.url.toLowerCase().includes(searchTerm)) ||
        (p.notes && p.notes.toLowerCase().includes(searchTerm))
      );
    }

    return passwords;
  }

  /**
   * Get categories
   */
  async getCategories(userId: string): Promise<Category[]> {
    const categoriesRef = collection(this.firestore, 'users', userId, 'categories');
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
  }

  /**
   * Get password history for a specific password
   */
  async getPasswordHistory(userId: string, passwordId: string): Promise<PasswordHistory[]> {
    const historyRef = collection(this.firestore, 'users', userId, 'passwordHistory');
    const q = query(historyRef, where('passwordId', '==', passwordId), orderBy('changedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PasswordHistory[];
  }

  /**
   * Initialize default categories for a new user
   */
  async initializeDefaultCategories(userId: string): Promise<void> {
    const defaultCategories: Omit<Category, 'id'>[] = [
      { name: 'Personal', color: '#4CAF50', icon: 'person' },
      { name: 'Work', color: '#2196F3', icon: 'work' },
      { name: 'Finance', color: '#FF9800', icon: 'account_balance' },
      { name: 'Shopping', color: '#E91E63', icon: 'shopping_cart' },
      { name: 'Social', color: '#9C27B0', icon: 'group' },
    ];

    for (const category of defaultCategories) {
      await this.addCategory(userId, category);
    }
  }

  /**
   * Clean up real-time listeners
   */
  cleanupListeners(): void {
    if (this.passwordsUnsubscribe) {
      this.passwordsUnsubscribe();
      this.passwordsUnsubscribe = null;
    }
    if (this.categoriesUnsubscribe) {
      this.categoriesUnsubscribe();
      this.categoriesUnsubscribe = null;
    }
    if (this.passwordHistoryUnsubscribe) {
      this.passwordHistoryUnsubscribe();
      this.passwordHistoryUnsubscribe = null;
    }
  }

  /**
   * Clear all user data (for demo mode cleanup)
   */
  clearUserData(): void {
    this.passwordsSubject.next([]);
    this.categoriesSubject.next([]);
    this.passwordHistorySubject.next([]);
    this.cleanupListeners();
  }
}
