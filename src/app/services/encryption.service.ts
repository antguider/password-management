import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private masterKey: string = '';
  private readonly DEFAULT_KEY = 'default-encryption-key-change-me';
  private readonly KEY_STORAGE_NAME = 'master-key-hash';

  constructor(private storageService: StorageService) {
    this.initializeMasterKey();
  }

  private initializeMasterKey(): void {
    // In a real app, this would be securely obtained from the user via login
    // For demo purposes, we use a default or stored key
    const storedKeyHash = this.storageService.getItem(this.KEY_STORAGE_NAME);
    
    if (!storedKeyHash) {
      // First time use - set up with default key
      this.setMasterKey(this.DEFAULT_KEY);
    } else {
      // Use existing key
      this.masterKey = this.DEFAULT_KEY;
    }
  }

  setMasterKey(key: string): boolean {
    try {
      // Store a hash of the key, not the key itself
      const keyHash = CryptoJS.SHA256(key).toString();
      this.storageService.setItem(this.KEY_STORAGE_NAME, keyHash);
      this.masterKey = key;
      return true;
    } catch (error) {
      console.error('Failed to set master key', error);
      return false;
    }
  }

  verifyMasterKey(key: string): boolean {
    const storedKeyHash = this.storageService.getItem(this.KEY_STORAGE_NAME);
    const inputKeyHash = CryptoJS.SHA256(key).toString();
    return storedKeyHash === inputKeyHash;
  }

  changeMasterKey(oldKey: string, newKey: string): boolean {
    if (!this.verifyMasterKey(oldKey)) {
      return false;
    }

    try {
      // Re-encrypt all data with the new key
      // For demo, we just set the new key
      return this.setMasterKey(newKey);
    } catch (error) {
      console.error('Failed to change master key', error);
      return false;
    }
  }

  encryptData(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.masterKey).toString();
    } catch (error) {
      console.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.masterKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  }

  generateRandomPassword(
    length: number = 16,
    includeUppercase: boolean = true,
    includeLowercase: boolean = true,
    includeNumbers: boolean = true,
    includeSymbols: boolean = true,
    excludeSimilarCharacters: boolean = false,
    excludeAmbiguousCharacters: boolean = false
  ): string {
    let charset = '';
    
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (excludeSimilarCharacters) {
      charset = charset.replace(/[ilLI|`1oO0]/g, '');
    }
    
    if (excludeAmbiguousCharacters) {
      charset = charset.replace(/[{}[\]()/\\'"~,;:.<>]/g, '');
    }
    
    if (charset.length === 0) {
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    }
    
    let password = '';
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    
    for (let i = 0; i < length; i++) {
      password += charset[values[i] % charset.length];
    }
    
    return password;
  }
}