import { Injectable } from '@angular/core';
import { User } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private sessionStorageKey = 'diatrendz_shared_user';

  constructor() {}

  /**
   * Retrieves the currently logged-in user from storage with proper try-catch error handling.
   */
  getCurrentUser(): User | null {
    try {
      const cached = localStorage.getItem(this.sessionStorageKey);
      if (!cached) {
        return null;
      }
      const user: User = JSON.parse(cached);
      if (user && user.role) {
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error parsing authenticated user session from localStorage:', error);
      // Clean up corrupt session state
      localStorage.removeItem(this.sessionStorageKey);
      return null;
    }
  }

  /**
   * Checks if the currently sessionized user has Administrative privileges (ADMIN or SUPER_ADMIN).
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    // Strict RBAC boundary check: both ADMIN and SUPER_ADMIN have administrative permissions
    return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  }

  /**
   * Simple check to see if user session exists and is active.
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.status === 'ACTIVE';
  }
}
