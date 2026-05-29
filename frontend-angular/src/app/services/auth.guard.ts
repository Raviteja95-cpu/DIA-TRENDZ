import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Evaluates route activation and prevents non-ADMIN users from accessing administrative pathways.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    try {
      const targetPath = state.url.toLowerCase();
      const currentUser = this.authService.getCurrentUser();

      // Check if user is authenticated at all
      if (!this.authService.isAuthenticated()) {
        console.warn(`[AuthGuard] Access Denied: Unauthenticated gateway attempt to ${state.url}`);
        // If there's an active login root or flow, we fallback to home or login URL tree
        return this.router.createUrlTree(['/']);
      }

      // If the target path is administrative (/settings or /testing)
      if (targetPath.includes('/settings') || targetPath.includes('/testing')) {
        const isAdminUser = this.authService.isAdmin();

        if (!isAdminUser) {
          // Robust compliance logging of the violation
          console.error(
            `[AuthGuard] RBAC Security Alarm: User "${currentUser?.fullName}" (ID: ${currentUser?.id}, Role: ${currentUser?.role}) requested restricted Admin route: ${state.url}`
          );

          // User-friendly diagnostic alert explaining the failure
          alert(
            `PERMISSIONS EXCEPTION:\nYour current artisan profile role (${currentUser?.role}) has insufficient authority to access the specified administration portal (${state.url}). Please contact a manager or system owner.`
          );

          // Force redirect to safe root dashboard view
          return this.router.createUrlTree(['/']);
        }
      }

      // Check succeeded: allow navigation
      return true;
    } catch (error) {
      // Robust error handling to catch unpredicted exceptions during route checking
      console.error('[AuthGuard] Unhandled exception in route guard logic pipeline:', error);
      // Fail-secure: default to blocking access and redirecting to root
      return this.router.createUrlTree(['/']);
    }
  }
}

/**
 * Modern Functional Guard wrapper for newer Angular routing methodologies.
 */
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(AuthGuard).canActivate(route, state);
};
