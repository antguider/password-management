import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StorageService } from '../../services/storage.service';
import { EncryptionService } from '../../services/encryption.service';
import { ClipboardService } from '../../services/clipboard.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  template: `
    <div class="container slide-up">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <div class="settings-grid">
        <mat-card class="settings-card security-card">
          <mat-card-header>
            <mat-card-title>Security Settings</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="setting-section">
              <h3>Master Password</h3>
              <p class="setting-description">
                Change your master password that encrypts all your stored passwords.
              </p>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Current Master Password</mat-label>
                <input matInput type="password" [(ngModel)]="currentMasterPassword">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New Master Password</mat-label>
                <input matInput type="password" [(ngModel)]="newMasterPassword">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirm New Master Password</mat-label>
                <input matInput type="password" [(ngModel)]="confirmMasterPassword">
              </mat-form-field>
              
              <div class="setting-actions">
                <button mat-raised-button color="primary" (click)="changeMasterPassword()">
                  Update Master Password
                </button>
              </div>
            </div>
            
            <mat-divider class="setting-divider"></mat-divider>
            
            <div class="setting-section">
              <h3>Auto-Lock</h3>
              <p class="setting-description">
                Configure when Vault should automatically lock.
              </p>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Auto-Lock After</mat-label>
                <mat-select [(ngModel)]="settings.autoLockTime">
                  <mat-option [value]="0">Never</mat-option>
                  <mat-option [value]="1">1 minute</mat-option>
                  <mat-option [value]="5">5 minutes</mat-option>
                  <mat-option [value]="15">15 minutes</mat-option>
                  <mat-option [value]="30">30 minutes</mat-option>
                  <mat-option [value]="60">1 hour</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-slide-toggle 
                [(ngModel)]="settings.lockOnClose" 
                color="primary">
                Lock when browser is closed
              </mat-slide-toggle>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="settings-card preferences-card">
          <mat-card-header>
            <mat-card-title>Preferences</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="setting-section">
              <h3>Clipboard Settings</h3>
              <p class="setting-description">
                Manage how passwords are copied to your clipboard.
              </p>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Clear Clipboard After</mat-label>
                <mat-select [(ngModel)]="settings.clipboardClearTime">
                  <mat-option [value]="0">Never</mat-option>
                  <mat-option [value]="10">10 seconds</mat-option>
                  <mat-option [value]="30">30 seconds</mat-option>
                  <mat-option [value]="60">1 minute</mat-option>
                  <mat-option [value]="120">2 minutes</mat-option>
                  <mat-option [value]="300">5 minutes</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <mat-divider class="setting-divider"></mat-divider>
            
            <div class="setting-section">
              <h3>Password Generator Defaults</h3>
              <p class="setting-description">
                Configure default settings for the password generator.
              </p>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Default Password Length</mat-label>
                <input matInput type="number" min="4" max="64" [(ngModel)]="settings.defaultPasswordLength">
              </mat-form-field>
              
              <div class="checkbox-group">
                <mat-slide-toggle 
                  [(ngModel)]="settings.defaultIncludeUppercase" 
                  color="primary">
                  Include uppercase letters
                </mat-slide-toggle>
                
                <mat-slide-toggle 
                  [(ngModel)]="settings.defaultIncludeLowercase" 
                  color="primary">
                  Include lowercase letters
                </mat-slide-toggle>
                
                <mat-slide-toggle 
                  [(ngModel)]="settings.defaultIncludeNumbers" 
                  color="primary">
                  Include numbers
                </mat-slide-toggle>
                
                <mat-slide-toggle 
                  [(ngModel)]="settings.defaultIncludeSymbols" 
                  color="primary">
                  Include symbols
                </mat-slide-toggle>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="settings-card data-card">
          <mat-card-header>
            <mat-card-title>Data Management</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="setting-section">
              <h3>Import & Export</h3>
              <p class="setting-description">
                Import passwords from other password managers or export your data.
              </p>
              
              <div class="setting-actions">
                <button mat-stroked-button color="primary" (click)="importData()">
                  <mat-icon>upload</mat-icon>
                  Import Data
                </button>
                
                <button mat-stroked-button color="primary" (click)="exportData()">
                  <mat-icon>download</mat-icon>
                  Export Data
                </button>
              </div>
            </div>
            
            <mat-divider class="setting-divider"></mat-divider>
            
            <div class="setting-section">
              <h3>Danger Zone</h3>
              <p class="setting-description warning-text">
                These actions cannot be undone. Please proceed with caution.
              </p>
              
              <mat-expansion-panel class="danger-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <span class="danger-text">Clear All Data</span>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <p>
                  This will permanently delete all your passwords and settings.
                  This action cannot be undone.
                </p>
                
                <div class="danger-confirmation">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Type "DELETE" to confirm</mat-label>
                    <input matInput [(ngModel)]="deleteConfirmation">
                  </mat-form-field>
                  
                  <button mat-raised-button color="warn" 
                    [disabled]="deleteConfirmation !== 'DELETE'"
                    (click)="clearAllData()">
                    <mat-icon>delete_forever</mat-icon>
                    Clear All Data
                  </button>
                </div>
              </mat-expansion-panel>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="settings-card about-card">
          <mat-card-header>
            <mat-card-title>About</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="about-content">
              <div class="app-info">
                <h2>Vault</h2>
                <p class="version">Version 1.0.0</p>
                <p class="description">
                  A secure password manager built with Angular and Material Design.
                </p>
              </div>
              
              <div class="feature-list">
                <h3>Features</h3>
                <ul>
                  <li>Secure password storage with encryption</li>
                  <li>Password generator with customization options</li>
                  <li>Password strength analysis</li>
                  <li>Auto-copy and clipboard management</li>
                  <li>Password history tracking</li>
                  <li>Category organization</li>
                </ul>
              </div>
              
              <div class="credits">
                <p>© 2025 Vault Password Manager</p>
                <p>Created with Angular and Material Design</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="settings-actions">
        <button mat-raised-button color="primary" (click)="saveSettings()">
          Save Settings
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 400;
      margin: 0;
      color: #3F51B5;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 24px;
    }

    .settings-card {
      height: 100%;
    }

    .security-card, .preferences-card {
      grid-column: span 1;
    }

    .data-card, .about-card {
      grid-column: span 1;
    }

    .full-width {
      width: 100%;
    }

    .setting-section {
      margin-bottom: 24px;
    }

    .setting-section h3 {
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: #333;
    }

    .setting-description {
      margin: 0 0 16px 0;
      color: #666;
    }

    .setting-divider {
      margin: 24px 0;
    }

    .setting-actions {
      display: flex;
      gap: 16px;
      margin-top: 16px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .warning-text {
      color: #f44336;
    }

    .danger-text {
      color: #f44336;
      font-weight: 500;
    }

    .danger-panel {
      margin-top: 16px;
      border: 1px solid rgba(244, 67, 54, 0.3);
    }

    .danger-confirmation {
      margin-top: 16px;
    }

    /* About Card Styles */
    .about-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .app-info h2 {
      font-size: 24px;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: #3F51B5;
    }

    .version {
      font-size: 14px;
      color: #666;
      margin: 0 0 8px 0;
    }

    .description {
      margin: 0;
    }

    .feature-list h3 {
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: #333;
    }

    .feature-list ul {
      margin: 0;
      padding-left: 20px;
    }

    .feature-list li {
      margin-bottom: 4px;
    }

    .credits {
      font-size: 14px;
      color: #666;
      text-align: center;
      margin-top: 16px;
    }

    .credits p {
      margin: 4px 0;
    }

    .settings-actions {
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 959px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }

      .security-card, .preferences-card, .data-card, .about-card {
        grid-column: span 1;
      }
      
      .setting-actions {
        flex-direction: column;
      }
      
      .setting-actions button {
        width: 100%;
      }
    }
  `]
})
export class SettingsComponent {
  settings = {
    autoLockTime: 15,
    lockOnClose: true,
    clipboardClearTime: 30,
    defaultPasswordLength: 16,
    defaultIncludeUppercase: true,
    defaultIncludeLowercase: true,
    defaultIncludeNumbers: true,
    defaultIncludeSymbols: true
  };
  
  currentMasterPassword = '';
  newMasterPassword = '';
  confirmMasterPassword = '';
  deleteConfirmation = '';

  constructor(
    private storageService: StorageService,
    private encryptionService: EncryptionService,
    private clipboardService: ClipboardService
  ) {
    this.loadSettings();
  }

  loadSettings(): void {
    const savedSettings = this.storageService.getItem('settings');
    if (savedSettings) {
      try {
        const decryptedSettings = this.encryptionService.decryptData(savedSettings);
        this.settings = JSON.parse(decryptedSettings);
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    }
  }

  saveSettings(): void {
    try {
      const encryptedSettings = this.encryptionService.encryptData(
        JSON.stringify(this.settings)
      );
      this.storageService.setItem('settings', encryptedSettings);
      
      // Toast notification would go here in a real app
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  }

  changeMasterPassword(): void {
    if (!this.currentMasterPassword) {
      // Toast notification would go here in a real app
      console.error('Current password is required');
      return;
    }
    
    if (!this.newMasterPassword) {
      // Toast notification would go here in a real app
      console.error('New password is required');
      return;
    }
    
    if (this.newMasterPassword !== this.confirmMasterPassword) {
      // Toast notification would go here in a real app
      console.error('New passwords do not match');
      return;
    }
    
    const success = this.encryptionService.changeMasterKey(
      this.currentMasterPassword,
      this.newMasterPassword
    );
    
    if (success) {
      // Toast notification would go here in a real app
      console.log('Master password changed successfully');
      this.currentMasterPassword = '';
      this.newMasterPassword = '';
      this.confirmMasterPassword = '';
    } else {
      // Toast notification would go here in a real app
      console.error('Current password is incorrect');
    }
  }

  importData(): void {
    // In a real app, this would open a file dialog and handle the import
    console.log('Import functionality would be implemented here');
    alert('Import functionality would be implemented here');
  }

  exportData(): void {
    // In a real app, this would export the encrypted data to a file
    console.log('Export functionality would be implemented here');
    alert('Export functionality would be implemented here');
  }

  clearAllData(): void {
    if (this.deleteConfirmation === 'DELETE') {
      this.storageService.clearAll();
      
      // Toast notification would go here in a real app
      console.log('All data has been cleared');
      this.deleteConfirmation = '';
      
      // In a real app, this would redirect to a login or welcome screen
      window.location.reload();
    }
  }
}