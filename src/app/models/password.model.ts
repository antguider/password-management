export interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category?: string;
  notes?: string;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  strength?: number;
}

export interface PasswordHistory {
  id: string;
  passwordId: string;
  oldPassword: string;
  changedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface PasswordFilter {
  searchTerm?: string;
  category?: string;
  favorite?: boolean;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'lastUsed' | 'strength';
  sortDirection?: 'asc' | 'desc';
}

export interface GeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilarCharacters: boolean;
  excludeAmbiguousCharacters: boolean;
}