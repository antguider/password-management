import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Password, PasswordHistory } from '../models/password.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private passwordsSubject = new BehaviorSubject<Password[]>([]);
  private passwordHistorySubject = new BehaviorSubject<PasswordHistory[]>([]);

  public passwords$ = this.passwordsSubject.asObservable();
  public passwordHistory$ = this.passwordHistorySubject.asObservable();

  private passwordsUnsubscribe: Unsubscribe | null = null;
  private passwordHistoryUnsubscribe: Unsubscribe | null = null;

  constructor(private firestore: Firestore) {}

  /**
   * Initialize real-time listeners for user data
   */
  initializeUserData(userId: string): void {
    this.cleanupListeners();
    
    // Listen to passwords
    const passwordsRef = collection(this.firestore, 'users', userId, 'passwords');
    console.log('Setting up Firestore listener for user:', userId);
    console.log('Firestore collection path:', `users/${userId}/passwords`);
    
    // Try without orderBy first to see if data exists
    console.log('🔥 Setting up onSnapshot listener...');
    this.passwordsUnsubscribe = onSnapshot(
      passwordsRef,
      (snapshot) => {
        console.log('🔥 Firestore passwords snapshot received:', snapshot.docs.length, 'documents');
        console.log('🔥 Snapshot metadata:', snapshot.metadata);
        console.log('🔥 Snapshot fromCache:', snapshot.metadata.fromCache);
        console.log('🔥 Snapshot hasPendingWrites:', snapshot.metadata.hasPendingWrites);
        const passwords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Password[];
        console.log('🔥 Processed passwords:', passwords);
        console.log('🔥 Updating passwordsSubject with', passwords.length, 'passwords');
        this.passwordsSubject.next(passwords);
      },
      (error) => {
        console.error('❌ Error listening to passwords:', error);
        console.error('❌ Error details:', error.code, error.message);
        console.log('Retrying without orderBy...');
        this.passwordsUnsubscribe = onSnapshot(
          passwordsRef,
          (snapshot) => {
            console.log('🔥 Firestore passwords snapshot (no orderBy):', snapshot.docs.length, 'documents');
            const passwords = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Password[];
            console.log('🔥 Processed passwords (no orderBy):', passwords);
            this.passwordsSubject.next(passwords);
          },
          (retryError) => {
            console.error('❌ Error listening to passwords (retry):', retryError);
          }
        );
      }
    );
    console.log('🔥 onSnapshot listener set up complete');

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
    const passwordData = {
      ...password,
      createdAt: password.createdAt || new Date(),
      updatedAt: password.updatedAt || new Date()
    };
    
    console.log('🔥 Adding password to Firestore:');
    console.log('🔥 User ID:', userId);
    console.log('🔥 Collection path:', `users/${userId}/passwords`);
    console.log('🔥 Password data:', passwordData);
    
    const docRef = await addDoc(passwordsRef, passwordData);
    console.log('🔥 Password added with ID:', docRef.id);
    
    // Immediately try to read it back to verify it was saved
    console.log('🔍 Verifying password was saved...');
    const doc = await getDoc(docRef);
    if (doc.exists()) {
      console.log('✅ Password verification successful:', doc.data());
    } else {
      console.log('❌ Password verification failed - document not found');
    }
    
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
    favorite?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<Password[]> {
    const passwordsRef = collection(this.firestore, 'users', userId, 'passwords');
    let q = query(passwordsRef);

    // Apply filters
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
   * Clean up real-time listeners
   */
  cleanupListeners(): void {
    if (this.passwordsUnsubscribe) {
      this.passwordsUnsubscribe();
      this.passwordsUnsubscribe = null;
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
    this.passwordHistorySubject.next([]);
    this.cleanupListeners();
  }

  /**
   * Debug method: Manually fetch all passwords for a user
   */
  async debugGetAllPasswords(userId: string): Promise<void> {
    console.log('🔍 DEBUG: Manually fetching all passwords for user:', userId);
    try {
      const passwordsRef = collection(this.firestore, 'users', userId, 'passwords');
      const snapshot = await getDocs(passwordsRef);
      console.log('🔍 DEBUG: Found', snapshot.docs.length, 'password documents');
      
      snapshot.docs.forEach((doc, index) => {
        console.log(`🔍 DEBUG: Password ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
    } catch (error) {
      console.error('🔍 DEBUG: Error fetching passwords:', error);
    }
  }

  /**
   * Test Firestore connectivity
   */
  async testFirestoreConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Firestore connection...');
      const testRef = collection(this.firestore, 'test');
      const testDoc = await addDoc(testRef, { test: true, timestamp: new Date() });
      console.log('✅ Firestore connection test successful, created test document:', testDoc.id);
      
      // Clean up test document
      await deleteDoc(testDoc);
      console.log('✅ Test document cleaned up');
      return true;
    } catch (error) {
      console.error('❌ Firestore connection test failed:', error);
      return false;
    }
  }
}
