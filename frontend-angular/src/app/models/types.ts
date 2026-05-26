export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'QC' | 'EMPLOYEE';
  phone?: string;
  profileImage?: string;
  department?: string;
  specialization?: string;
  skillLevel?: string;
  status: 'ACTIVE' | 'DISABLED';
  leaveStatus: 'ACTIVE' | 'ON_LEAVE';
  productivityScore?: number;
  leaveBalance?: number;
  joiningDate?: string;
}

export interface EmailDomain {
  id: string;
  domain: string;
  isDefault: boolean;
}

export interface InterruptionLog {
  id?: number | string;
  pausedAt: string;
  reason: string;
  durationMinutes: number;
}

export interface TimelineEvent {
  id?: number | string;
  status: string;
  timestamp: string;
  payload?: string;
  user: string;
}

export interface JobCard {
  id: string;
  taskId: string;
  customerName: string;
  jewelryType: string;
  complexityLevel: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  goldWeight: number;
  materialType: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  dueDate: string;
  estimatedTime: number;
  approvedTime: number;
  actualTime: number;
  progressPercent: number;
  remarks: string;
  status: string;
  qcRemarks?: string;
  qcDefects?: string;
  reworkHours?: number;
  startedAt?: string;
  lastResumedAt?: string;
  totalWorkedMs?: number;
  workImages: string[];
  interruptionLogs: InterruptionLog[];
  timeline: TimelineEvent[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  remarks: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  adminRemarks?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
}

export interface LiveMetrics {
  activeEmployees: number;
  employeesOnLeave: number;
  jobsInProgress: number;
  delayedJobs: number;
  urgentTasks: number;
  completedToday: number;
  pendingApprovals: number;
  qcPendingJobs: number;
}
