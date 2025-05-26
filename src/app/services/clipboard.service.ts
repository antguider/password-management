import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
  private timeoutId: number | null = null;

  constructor() {}

  /**
   * Copy text to clipboard with optional timeout to clear
   * @param text Text to copy
   * @param clearAfterMs Time in ms after which clipboard will be cleared (0 for no clearing)
   * @returns Promise resolving to true if copy was successful
   */
  async copyToClipboard(text: string, clearAfterMs: number = 0): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      
      // Clear previous timeout if exists
      if (this.timeoutId !== null) {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      
      // Set new timeout if needed
      if (clearAfterMs > 0) {
        this.timeoutId = window.setTimeout(() => {
          navigator.clipboard.writeText('');
          this.timeoutId = null;
        }, clearAfterMs);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
      return false;
    }
  }

  /**
   * Immediately clear clipboard
   */
  clearClipboard(): Promise<boolean> {
    return this.copyToClipboard('');
  }
}