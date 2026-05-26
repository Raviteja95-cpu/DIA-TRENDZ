import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { User, LiveMetrics } from './models/types';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit {
  // Global Active Session States model matching pristine React interfaces
  currentUser: User | null = null;
  activeTab: string = 'dashboard';
  notifications: Array<{ id: string; message: string; timestamp: string; read: boolean }> = [];
  metrics: LiveMetrics | null = null;
  isSettingsOpen: boolean = false;
  
  // Whitelist Domain management States
  whitelistedDomains: any[] = [];
  newDomainName: string = '';
  
  // Roster listing cache
  employeesList: User[] = [];

  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.restoreUserSession();
    if (this.currentUser) {
      this.fetchEssentialMetrics();
      this.loadRosterList();
    }
  }

  restoreUserSession() {
    const cached = localStorage.getItem('diatrendz_shared_user');
    if (cached) {
      try {
        this.currentUser = JSON.parse(cached);
        this.triggerInitialNotification('Authenticated', `Session restored for ${this.currentUser?.fullName}`);
      } catch (e) {
        localStorage.removeItem('diatrendz_shared_user');
      }
    }
  }

  handleLoginSuccess(user: User) {
    this.currentUser = user;
    localStorage.setItem('diatrendz_shared_user', JSON.stringify(user));
    this.fetchEssentialMetrics();
    this.loadRosterList();
    this.triggerInitialNotification('Success', `Welcome back, ${user.fullName}`);
  }

  handleLogout() {
    if (this.currentUser) {
      this.triggerInitialNotification('Session Closed', `Goldsmith portal secure exit finished.`);
    }
    this.currentUser = null;
    localStorage.removeItem('diatrendz_shared_user');
  }

  // Live Sync Metric Loop
  fetchEssentialMetrics() {
    this.apiService.getMetrics().subscribe({
      next: (m) => this.metrics = m,
      error: () => console.warn('Failed sync active metrics')
    });
  }

  loadRosterList() {
    this.apiService.getEmployees().subscribe({
      next: (list) => this.employeesList = list,
      error: () => console.warn('Failed to load roster listings')
    });
  }

  triggerInitialNotification(title: string, msg: string) {
    const item = {
      id: 'NOTI-' + Date.now(),
      message: `[${title}] ${msg}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    this.notifications.unshift(item);
    if (this.notifications.length > 5) {
      this.notifications = this.notifications.slice(0, 5);
    }
  }

  markAllNotificationsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  clearAllLogs() {
    this.notifications = [];
  }

  // Whitelist domains systems management
  openDomainSettings() {
    this.isSettingsOpen = true;
    this.apiService.getDomains().subscribe({
      next: (doms) => this.whitelistedDomains = doms
    });
  }

  registerDomain() {
    if (!this.newDomainName.startsWith('@')) {
      alert('Email domain must begin with @ (e.g. @diatrendz.com)');
      return;
    }
    if (!this.currentUser) return;

    this.apiService.addDomain({
      domain: this.newDomainName,
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.role
    }).subscribe({
      next: (res) => {
        this.whitelistedDomains = res.domains;
        this.newDomainName = '';
        this.triggerInitialNotification('Registry', 'Successfully whitelisted domain.');
      },
      error: (e: any) => alert(e.error?.message || 'Error configuring domain')
    });
  }

  deleteRegisteredDomain(id: string) {
    if (!this.currentUser) return;
    this.apiService.deleteDomain({
      id,
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.role
    }).subscribe({
      next: (res) => {
        this.whitelistedDomains = res.domains;
        this.triggerInitialNotification('Registry', 'Successfully removed whitelisted domain.');
      },
      error: (e: any) => alert(e.error?.message || 'Deletion denied')
    });
  }

  setPrimarySystemDomain(id: string) {
    if (!this.currentUser) return;
    this.apiService.setDefaultDomain({
      id,
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.role
    }).subscribe({
      next: (res) => {
        this.whitelistedDomains = res.domains;
        this.triggerInitialNotification('Registry', 'Modified primary default corporate domain.');
      }
    });
  }

  closeRegistrySettings() {
    this.isSettingsOpen = false;
  }
}
// Completed Angular roots control logic
