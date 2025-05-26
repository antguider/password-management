import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storagePrefix = 'vault_';

  constructor() {}

  /**
   * Set an item in local storage
   */
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(`${this.storagePrefix}${key}`, value);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  /**
   * Get an item from local storage
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(`${this.storagePrefix}${key}`);
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  }

  /**
   * Remove an item from local storage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.storagePrefix}${key}`);
    } catch (error) {
      console.error('Error removing from localStorage', error);
    }
  }

  /**
   * Clear all items with the storage prefix
   */
  clearAll(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.storagePrefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  /**
   * Check if an item exists in storage
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }
}