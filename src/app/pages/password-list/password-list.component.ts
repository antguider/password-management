import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { PasswordCardComponent } from '../../components/password-card/password-card.component';
import { PasswordService } from '../../services/password.service';
import { Password, Category, PasswordFilter } from '../../models/password.model';

@Component({
  selector: 'app-password-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatToolbarModule,
    MatMenuModule,
    PasswordCardComponent
  ],
  template: `
    <div class="container slide-up">
      <div class="page-header">
        <h1>Your Passwords</h1>
        <a mat-raised-button color="primary" routerLink="/passwords/new">
          <mat-icon>add</mat-icon>
          Add New Password
        </a>
      </div>

      <mat-card class="filter-card">
        <div class="filter-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search</mat-label>
            <input matInput type="text" [(ngModel)]="filter.searchTerm" 
              placeholder="Search passwords" (keyup)="applyFilter()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div class="filter-actions">
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="filter.category" (selectionChange)="applyFilter()">
                <mat-option [value]="undefined">All Categories</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category.name">
                  {{ category.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Sort By</mat-label>
              <mat-select [(ngModel)]="filter.sortBy" (selectionChange)="applyFilter()">
                <mat-option value="title">Title</mat-option>
                <mat-option value="updatedAt">Last Updated</mat-option>
                <mat-option value="createdAt">Date Created</mat-option>
                <mat-option value="lastUsed">Last Used</mat-option>
                <mat-option value="strength">Password Strength</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button [matMenuTriggerFor]="sortMenu" class="sort-direction-button">
              <mat-icon>{{ filter.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
            </button>
            <mat-menu #sortMenu="matMenu">
              <button mat-menu-item (click)="toggleSortDirection('asc')">
                <mat-icon>arrow_upward</mat-icon>
                <span>Ascending</span>
              </button>
              <button mat-menu-item (click)="toggleSortDirection('desc')">
                <mat-icon>arrow_downward</mat-icon>
                <span>Descending</span>
              </button>
            </mat-menu>
          </div>
        </div>

        <div class="filter-chips">
          <div class="active-filters">
            <mat-chip-set>
              <mat-chip *ngIf="filter.searchTerm" (removed)="removeSearchFilter()">
                Search: {{ filter.searchTerm }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
              <mat-chip *ngIf="filter.category" (removed)="removeCategoryFilter()">
                Category: {{ filter.category }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
              <mat-chip *ngIf="filter.favorite" (removed)="removeFavoriteFilter()">
                Favorites Only
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
            </mat-chip-set>
          </div>

          <div class="filter-toggles">
            <button mat-stroked-button 
              [class.active-filter]="filter.favorite"
              (click)="toggleFavoriteFilter()">
              <mat-icon>{{ filter.favorite ? 'star' : 'star_border' }}</mat-icon>
              Favorites
            </button>
            <button mat-stroked-button 
              (click)="resetFilters()"
              [disabled]="!hasActiveFilters()">
              <mat-icon>clear_all</mat-icon>
              Clear All
            </button>
          </div>
        </div>
      </mat-card>

      <div class="passwords-list">
        <div *ngIf="filteredPasswords.length === 0" class="empty-state">
          <mat-icon>vpn_key</mat-icon>
          <p *ngIf="passwordCount === 0">No passwords yet. Add your first password to get started.</p>
          <p *ngIf="passwordCount > 0">No passwords match your current filters.</p>
          <button *ngIf="passwordCount > 0" mat-button color="primary" (click)="resetFilters()">
            Clear Filters
          </button>
        </div>

        <app-password-card 
          *ngFor="let password of filteredPasswords" 
          [password]="password"
          (deleted)="onPasswordDeleted($event)"
        ></app-password-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 400;
      margin: 0;
      color: #3F51B5;
    }

    .filter-card {
      margin-bottom: 24px;
      padding: 16px;
    }

    .filter-container {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .search-field {
      flex: 1;
      min-width: 200px;
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-form-field {
      margin-bottom: -1.25em;
    }

    .sort-direction-button {
      margin-top: -20px;
    }

    .filter-chips {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .filter-toggles {
      display: flex;
      gap: 8px;
    }

    .active-filter {
      background-color: rgba(63, 81, 181, 0.1);
      color: #3F51B5;
    }

    .passwords-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      color: #888;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .filter-container {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-actions {
        width: 100%;
      }

      .filter-chips {
        flex-direction: column;
        align-items: flex-start;
      }

      .filter-toggles {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class PasswordListComponent implements OnInit {
  passwords: Password[] = [];
  filteredPasswords: Password[] = [];
  categories: Category[] = [];
  passwordCount = 0;
  
  filter: PasswordFilter = {
    sortBy: 'updatedAt',
    sortDirection: 'desc'
  };

  constructor(private passwordService: PasswordService) {}

  ngOnInit(): void {
    this.loadPasswords();
    this.loadCategories();
  }

  loadPasswords(): void {
    this.passwordService.getPasswords().subscribe(passwords => {
      this.passwords = passwords;
      this.passwordCount = passwords.length;
      this.applyFilter();
    });
  }

  loadCategories(): void {
    this.passwordService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  applyFilter(): void {
    this.passwordService.setFilter(this.filter);
    this.passwordService.getPasswords().subscribe(filtered => {
      this.filteredPasswords = filtered;
    });
  }

  toggleFavoriteFilter(): void {
    this.filter.favorite = !this.filter.favorite;
    this.applyFilter();
  }

  toggleSortDirection(direction: 'asc' | 'desc'): void {
    this.filter.sortDirection = direction;
    this.applyFilter();
  }

  removeSearchFilter(): void {
    this.filter.searchTerm = undefined;
    this.applyFilter();
  }

  removeCategoryFilter(): void {
    this.filter.category = undefined;
    this.applyFilter();
  }

  removeFavoriteFilter(): void {
    this.filter.favorite = undefined;
    this.applyFilter();
  }

  resetFilters(): void {
    this.passwordService.resetFilter();
    this.filter = {
      sortBy: 'updatedAt',
      sortDirection: 'desc'
    };
    this.applyFilter();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filter.searchTerm || 
      this.filter.category || 
      this.filter.favorite !== undefined
    );
  }

  onPasswordDeleted(id: string): void {
    this.filteredPasswords = this.filteredPasswords.filter(p => p.id !== id);
    this.passwordCount--;
  }
}