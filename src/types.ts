/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'QC';

export interface User {
  id: string; // Worker ID or Admin ID
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  department?: string; // e.g. "Casting", "Polishing", "Setting", "QC"
  specialization?: string; // e.g. "Solitaire Rings", "Luxury Necklaces", "Hand Graving"
  skillLevel?: 'Beginner' | 'Intermediate' | 'Expert' | 'Master';
  status: 'ACTIVE' | 'DISABLED';
  leaveStatus: 'ACTIVE' | 'ON_LEAVE'; // ON_LEAVE hides them from Task assignments
  productivityScore: number;
  leaveBalance: number;
  joiningDate: string;
}

export interface EmailDomain {
  id: string;
  domain: string; // e.g. "@diatrendz.com"
  isDefault: boolean;
}

export type JobStatus =
  | 'Assigned'
  | 'Accepted'
  | 'Waiting Approval'
  | 'Approved'
  | 'In Progress'
  | 'Paused'
  | 'Switched'
  | 'QC Pending'
  | 'Completed'
  | 'Delayed'
  | 'Rework'
  | 'Cancelled';

export interface InterruptionLog {
  id: string;
  pausedAt: string;
  resumedAt?: string;
  reason: string;
  durationMinutes: number;
}

export interface TimelineEvent {
  status: JobStatus | 'Created' | 'QC Rejected' | 'Estimation Submitted';
  timestamp: string;
  payload?: string;
  user: string;
}

export interface JobCard {
  id: string; // Job ID (e.g., JOB-1001)
  taskId: string; // Task ID (e.g., TSK-1001)
  customerName: string;
  jewelryType: 'Ring' | 'Necklace' | 'Bracelet' | 'Earrings' | 'Pendant' | 'Custom Jewelry';
  complexityLevel: 'Simple' | 'Medium' | 'Complex' | 'Premium';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  goldWeight: number; // weight in grams
  materialType: string; // e.g. "18K Gold", "22K Yellow Gold", "Platinum"
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  dueDate: string;
  estimatedTime: number; // employee input hours
  approvedTime: number; // admin approved / modified hours
  actualTime: number; // tracks worked hours
  progressPercent: number; // 0 to 100
  remarks: string;
  status: JobStatus;
  workImages: string[];
  qcRemarks?: string;
  qcDefects?: string;
  reworkHours?: number;
  interruptionLogs: InterruptionLog[];
  timeline: TimelineEvent[];
  startedAt?: string;
  lastResumedAt?: string;
  totalWorkedMs?: number; // total worked duration in ms
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'vacation' | 'sick' | 'emergency' | 'monthly';
  startDate: string;
  endDate: string;
  remarks: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminRemarks?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}

export interface SystemMetrics {
  activeEmployees: number;
  employeesOnLeave: number;
  jobsInProgress: number;
  delayedJobs: number;
  urgentTasks: number;
  completedToday: number;
  pendingApprovals: number;
  qcPendingJobs: number;
}

export interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  days: number;
  createdBy: string;
  creatorRole: UserRole;
  status: 'APPROVED' | 'PENDING_DECISION';
}
