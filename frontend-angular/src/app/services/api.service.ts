import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, EmailDomain, JobCard, LeaveRequest, AuditLog, LiveMetrics } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Configurable base URL linking to the Spring Boot back-end port
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Authentications
  login(credentials: { email: string; password: string }): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>(`${this.baseUrl}/api/auth/login`, credentials);
  }

  updateProfile(payload: { userId: string; email?: string; password?: string; fullName?: string; phone?: string }): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>(`${this.baseUrl}/api/auth/update`, payload);
  }

  // whitelist domains
  getDomains(): Observable<EmailDomain[]> {
    return this.http.get<EmailDomain[]>(`${this.baseUrl}/api/domains`);
  }

  addDomain(payload: { domain: string; isDefault?: boolean; userId: string; userName: string; userRole: string }): Observable<{ success: boolean; domains: EmailDomain[] }> {
    return this.http.post<{ success: boolean; domains: EmailDomain[] }>(`${this.baseUrl}/api/domains`, payload);
  }

  deleteDomain(payload: { id: string; userId: string; userName: string; userRole: string }): Observable<{ success: boolean; domains: EmailDomain[] }> {
    return this.http.post<{ success: boolean; domains: EmailDomain[] }>(`${this.baseUrl}/api/domains/delete`, payload);
  }

  setDefaultDomain(payload: { id: string; userId: string; userName: string; userRole: string }): Observable<{ success: boolean; domains: EmailDomain[] }> {
    return this.http.post<{ success: boolean; domains: EmailDomain[] }>(`${this.baseUrl}/api/domains/default`, payload);
  }

  // crew employees
  getEmployees(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/api/employees`);
  }

  createEmployee(payload: any): Observable<{ success: boolean; employee: User }> {
    return this.http.post<{ success: boolean; employee: User }>(`${this.baseUrl}/api/employees`, payload);
  }

  updateEmployee(payload: any): Observable<{ success: boolean; employee: User }> {
    return this.http.post<{ success: boolean; employee: User }>(`${this.baseUrl}/api/employees/update`, payload);
  }

  // active jobs
  getTasks(): Observable<JobCard[]> {
    return this.http.get<JobCard[]>(`${this.baseUrl}/api/tasks`);
  }

  createTask(payload: any): Observable<{ success: boolean; task: JobCard }> {
    return this.http.post<{ success: boolean; task: JobCard }>(`${this.baseUrl}/api/tasks`, payload);
  }

  reassignTask(payload: { taskId: string; newEmployeeId: string; newEmployeeName: string; userId: string; userName: string; userRole: string }): Observable<{ success: boolean; task: JobCard }> {
    return this.http.post<{ success: boolean; task: JobCard }>(`${this.baseUrl}/api/tasks/reassign`, payload);
  }

  updateTaskStatus(payload: { taskId: string; status: string; extraPayload?: any; remarks?: string; userId: string; userName: string; userRole: string }): Observable<{ success: boolean; task: JobCard }> {
    return this.http.post<{ success: boolean; task: JobCard }>(`${this.baseUrl}/api/tasks/status`, payload);
  }

  qcReview(payload: { taskId: string; action: 'approve' | 'rework'; remarks?: string; defects?: string; reworkHours?: number; userId: string; userName: string; userRole: string }): Observable<{ success: boolean; task: JobCard }> {
    return this.http.post<{ success: boolean; task: JobCard }>(`${this.baseUrl}/api/tasks/qc-review`, payload);
  }

  uploadTaskImage(payload: { taskId: string; imageBase64: string; userId: string; userName: string; userRole: string }): Observable<{ success: boolean; task: JobCard }> {
    return this.http.post<{ success: boolean; task: JobCard }>(`${this.baseUrl}/api/tasks/upload-image`, payload);
  }

  // vacation planners
  getLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/api/leave`);
  }

  createLeaveRequest(payload: { employeeId: string; leaveType: string; startDate: string; endDate: string; remarks: string }): Observable<{ success: boolean; request: LeaveRequest }> {
    return this.http.post<{ success: boolean; request: LeaveRequest }>(`${this.baseUrl}/api/leave`, payload);
  }

  reviewLeaveRequest(payload: { leaveId: string; status: 'APPROVED' | 'REJECTED'; adminRemarks?: string; userId: string; userName: string; userRole: string }): Observable<{ success: boolean; request: LeaveRequest }> {
    return this.http.post<{ success: boolean; request: LeaveRequest }>(`${this.baseUrl}/api/leave/review`, payload);
  }

  extendLeave(payload: { leaveId: string; newEndDate: string; remarks?: string; userId: string; userName: string; userRole: string }): Observable<{ success: boolean; request: LeaveRequest }> {
    return this.http.post<{ success: boolean; request: LeaveRequest }>(`${this.baseUrl}/api/leave/extend`, payload);
  }

  // historical queries
  searchHistory(filters: { query?: string; jewelryType?: string; employeeId?: string; status?: string; startDate?: string; endDate?: string }): Observable<JobCard[]> {
    let queryParams = '?';
    if (filters.query) queryParams += `query=${encodeURIComponent(filters.query)}&`;
    if (filters.jewelryType) queryParams += `jewelryType=${encodeURIComponent(filters.jewelryType)}&`;
    if (filters.employeeId) queryParams += `employeeId=${encodeURIComponent(filters.employeeId)}&`;
    if (filters.status) queryParams += `status=${encodeURIComponent(filters.status)}&`;
    if (filters.startDate) queryParams += `startDate=${encodeURIComponent(filters.startDate)}&`;
    if (filters.endDate) queryParams += `endDate=${encodeURIComponent(filters.endDate)}&`;
    return this.http.get<JobCard[]>(`${this.baseUrl}/api/history${queryParams}`);
  }

  // interactive metrics
  getMetrics(): Observable<LiveMetrics> {
    return this.http.get<LiveMetrics>(`${this.baseUrl}/api/metrics`);
  }

  getLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/api/logs`);
  }

  getDiagnostics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/diagnostics`);
  }
}
