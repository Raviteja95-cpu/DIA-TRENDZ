/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Gem,
  LayoutDashboard,
  Users,
  Briefcase,
  History,
  Settings,
  ShieldCheck,
  LogOut,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Bell,
  CheckCircle,
  Play,
  Pause,
  Shuffle,
  Clock,
  CheckSquare,
  Upload,
  User,
  Activity,
  UserCheck,
  Search,
  X,
  ExternalLink,
  FileText,
  Menu,
  MoreVertical,
  Package
} from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { EmployeeForm } from './components/EmployeeForm';
import { TaskForm } from './components/TaskForm';
import { LeaveCalendar } from './components/LeaveCalendar';
import { HistoricalSearch } from './components/HistoricalSearch';
import { PerformanceRankings } from './components/PerformanceRankings';
import { SuperAdminSettings } from './components/SuperAdminSettings';
import { QCModule } from './components/QCModule';
import { WorkReports } from './components/WorkReports';
import { ModernAnalytics } from './components/ModernAnalytics';
import { JobBagTracker } from './components/JobBagTracker';
import { JobCard, SystemMetrics } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'personnel' | 'tasks' | 'leave' | 'qc' | 'analytics' | 'history' | 'settings' | 'reports' | 'tracker'>('dashboard');

  // Metrics database stats
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeEmployees: 0,
    employeesOnLeave: 0,
    jobsInProgress: 0,
    delayedJobs: 0,
    urgentTasks: 0,
    completedToday: 0,
    pendingApprovals: 0,
    qcPendingJobs: 0
  });

  const [tasks, setTasks] = useState<JobCard[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; urgent?: boolean; targetTab?: 'dashboard' | 'personnel' | 'tasks' | 'leave' | 'qc' | 'analytics' | 'history' | 'settings' | 'reports'; targetId?: string }[]>([
    { id: '1', text: 'New urgent solitaire ring mounting dispatched', time: 'Just now', urgent: true, targetTab: 'tasks' },
    { id: '2', text: 'Ahmed Bin Al-Maktoum filed emergency vacation clearance', time: '10m ago', targetTab: 'leave' }
  ]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Bench worker input panels states
  const [selectedTaskForEstimate, setSelectedTaskForEstimate] = useState<JobCard | null>(null);
  const [tempHoursEstimate, setTempHoursEstimate] = useState(8);

  const [selectedTaskForPause, setSelectedTaskForPause] = useState<JobCard | null>(null);
  const [tempPauseReason, setTempPauseReason] = useState('');

  // Admin Approve estimate states
  const [approvingTask, setApprovingTask] = useState<JobCard | null>(null);
  const [tempApprovedHours, setTempApprovedHours] = useState(1);

  // Employee standard image attachment states
  const [uploadTaskTarget, setUploadTaskTarget] = useState<JobCard | null>(null);
  const [tempImage64, setTempImage64] = useState('');
  const [artisanFilter, setArtisanFilter] = useState<'ALL' | 'BUSY' | 'FREE' | 'UNAVAILABLE'>('ALL');
  const [dashboardTaskFilter, setDashboardTaskFilter] = useState<'ALL' | 'IN_PROGRESS' | 'WAITING_APPROVAL' | 'QC_PENDING' | 'COMPLETED' | 'DELAYED' | 'URGENT'>('ALL');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Omnipresent search state declarations
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [inspectedTask, setInspectedTask] = useState<JobCard | null>(null);
  const [inspectedEmployee, setInspectedEmployee] = useState<any | null>(null);
  const [trackerSelectedJobId, setTrackerSelectedJobId] = useState<string | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    fullName: string;
    role: string;
    status: string;
    successRate: number;
    currentJobId?: string;
    currentJobType?: string;
  } | null>(null);

  // Initial load
  useEffect(() => {
    // Try restoring session from localStorage if available
    const savedUser = localStorage.getItem('diatrendz_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        // Set standard active tab based on role
        if (parsed.role === 'EMPLOYEE') {
          setActiveTab('tasks');
        } else if (parsed.role === 'QC') {
          setActiveTab('qc');
        } else {
          setActiveTab('dashboard');
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Global click-away listener for omnipresent search bar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const container = document.getElementById('global-search-container');
      if (container && !container.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync metrics and tasks whenever user context exists
  useEffect(() => {
    if (currentUser) {
      fetchLiveDashboardData();
      const tick = setInterval(fetchLiveDashboardData, 6000);
      return () => clearInterval(tick);
    }
  }, [currentUser]);

  const fetchLiveDashboardData = async () => {
    try {
      const [metRes, tskRes, empRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/tasks'),
        fetch('/api/employees')
      ]);

      if (metRes.ok && tskRes.ok && empRes.ok) {
        setMetrics(await metRes.json());
        setTasks(await tskRes.json());
        setEmployees(await empRes.json());
      }
    } catch (err) {
      console.error('Real-time sync error', err);
    }
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('diatrendz_user', JSON.stringify(user));

    if (user.role === 'EMPLOYEE') {
      setActiveTab('tasks');
    } else if (user.role === 'QC') {
      setActiveTab('qc');
    } else {
      setActiveTab('dashboard');
    }

    addVisualNotification('Authentication Success. System session active.', false);
  };

  const handleLogout = () => {
    localStorage.removeItem('diatrendz_user');
    setCurrentUser(null);
  };

  const addVisualNotification = (
    text: string, 
    urgent = false, 
    targetTab?: 'dashboard' | 'personnel' | 'tasks' | 'leave' | 'qc' | 'analytics' | 'history' | 'settings' | 'reports', 
    targetId?: string
  ) => {
    let detectedTab = targetTab;
    if (!detectedTab) {
      const lower = text.toLowerCase();
      if (lower.includes('task') || lower.includes('estimate') || lower.includes('estimation') || lower.includes('bench') || lower.includes('job') || lower.includes('solitaire') || lower.includes('mounting')) {
        detectedTab = 'tasks';
      } else if (lower.includes('leave') || lower.includes('vacation')) {
        detectedTab = 'leave';
      } else if (lower.includes('qc') || lower.includes('quality') || lower.includes('review') || lower.includes('checker') || lower.includes('dispatched')) {
        detectedTab = 'qc';
      } else if (lower.includes('artisan') || lower.includes('specialist') || lower.includes('crew') || lower.includes('employee')) {
        detectedTab = 'personnel';
      } else if (lower.includes('report') || lower.includes('dossier')) {
        detectedTab = 'reports';
      } else if (lower.includes('analytics') || lower.includes('performance') || lower.includes('ranking')) {
        detectedTab = 'analytics';
      } else if (lower.includes('history') || lower.includes('search')) {
        detectedTab = 'history';
      }
    }

    let detectedId = targetId;
    if (!detectedId) {
      const match = text.match(/(TSK-\d+|JOB-\d+)/i);
      if (match) {
        detectedId = match[1].toUpperCase();
      } else {
        const wordMatch = text.match(/card\s+([A-Z0-9-]+)/i) || text.match(/task:\s*([A-Z0-9-]+)/i) || text.match(/for\s+([A-Z0-9-]+)/i);
        if (wordMatch) {
          detectedId = wordMatch[1].toUpperCase();
        }
      }
    }

    setNotifications(prev => [
      { id: Date.now().toString(), text, time: 'Just now', urgent, targetTab: detectedTab, targetId: detectedId },
      ...prev.slice(0, 9)
    ]);
  };

  const handleNotificationClick = (n: any) => {
    setShowNotificationPopup(false);
    if (!currentUser) return;

    // Detect target page / tab
    let destination: any = n.targetTab;
    if (!destination) {
      const lower = n.text.toLowerCase();
      if (lower.includes('task') || lower.includes('estimate') || lower.includes('estimation') || lower.includes('bench') || lower.includes('job') || lower.includes('solitaire') || lower.includes('mounting')) {
        destination = 'tasks';
      } else if (lower.includes('leave') || lower.includes('vacation')) {
        destination = 'leave';
      } else if (lower.includes('qc') || lower.includes('quality') || lower.includes('review') || lower.includes('checker')) {
        destination = 'qc';
      } else if (lower.includes('artisan') || lower.includes('specialist') || lower.includes('crew') || lower.includes('employee')) {
        destination = 'personnel';
      } else if (lower.includes('report') || lower.includes('dossier')) {
        destination = 'reports';
      } else if (lower.includes('analytics') || lower.includes('performance') || lower.includes('ranking')) {
        destination = 'analytics';
      } else if (lower.includes('history') || lower.includes('search')) {
        destination = 'history';
      } else {
        destination = 'dashboard';
      }
    }

    // Guard with user roles
    if (currentUser.role === 'EMPLOYEE') {
      if (destination !== 'tasks' && destination !== 'leave') {
        destination = 'tasks';
      }
    } else if (currentUser.role === 'QC') {
      if (destination !== 'qc' && destination !== 'leave' && destination !== 'history') {
        destination = 'qc';
      }
    }

    setActiveTab(destination);

    // If there is a target ID (job card ID)
    let targetJobId = n.targetId;
    if (!targetJobId) {
      const match = n.text.match(/(TSK-\d+|JOB-\d+)/i);
      if (match) {
        targetJobId = match[1].toUpperCase();
      } else {
         const wordMatch = n.text.match(/card\s+([A-Z0-9-]+)/i) || n.text.match(/task:\s*([A-Z0-9-]+)/i) || n.text.match(/for\s+([A-Z0-9-]+)/i);
         if (wordMatch) {
           targetJobId = wordMatch[1].toUpperCase();
         }
      }
    }

    if (targetJobId) {
      const foundTask = tasks.find(t => t.id.toUpperCase() === targetJobId.toUpperCase());
      if (foundTask) {
        setInspectedTask(foundTask);
      }
    }
  };

  // Crew and Task Lifecycle Updates
  const handleAcceptTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          status: 'Accepted',
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        fetchLiveDashboardData();
        addVisualNotification(`Accepted manufacturing task: ${taskId}`, false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForEstimate) return;

    try {
      const res = await fetch('/api/tasks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTaskForEstimate.id,
          status: 'Waiting Approval',
          extraPayload: tempHoursEstimate,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        setSelectedTaskForEstimate(null);
        fetchLiveDashboardData();
        addVisualNotification(`Estimation submitted (${tempHoursEstimate} hrs) for ${selectedTaskForEstimate.id}`, false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminReviewEstimate = async (action: 'approve' | 'modify') => {
    if (!approvingTask) return;

    try {
      const res = await fetch('/api/tasks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: approvingTask.id,
          status: 'Approved',
          extraPayload: tempApprovedHours,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        setApprovingTask(null);
        fetchLiveDashboardData();
        addVisualNotification(`Approved fabrication hours limit for ${approvingTask.id}`, false);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to approve estimate:", errData);
        setApprovingTask(null);
        fetchLiveDashboardData();
      }
    } catch (err) {
      console.error(err);
      setApprovingTask(null);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          status: 'In Progress',
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        fetchLiveDashboardData();
        addVisualNotification(`Artisan active on work tools representing ${taskId}`, false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePauseTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForPause) return;

    try {
      const res = await fetch('/api/tasks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTaskForPause.id,
          status: 'Paused',
          remarks: tempPauseReason || 'Urgent Bench Switch Interruption',
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        setSelectedTaskForPause(null);
        setTempPauseReason('');
        fetchLiveDashboardData();
        addVisualNotification(`Artisan paused job shift for ${selectedTaskForPause.id}`, false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchTask = async (job: JobCard) => {
    // Automatically pause current task and start urgent task
    try {
      // First, find if employee already has another active task and pause it
      const activeTask = tasks.find(t => t.assignedEmployeeId === currentUser.id && t.status === 'In Progress');
      if (activeTask) {
        await fetch('/api/tasks/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: activeTask.id,
            status: 'Switched',
            remarks: `Automated switch-off to prioritize high priority task ${job.id}`,
            userId: currentUser.id,
            userName: currentUser.fullName,
            userRole: currentUser.role
          })
        });
      }

      // Start the urgent task
      await fetch('/api/tasks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: job.id,
          status: 'In Progress',
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      fetchLiveDashboardData();
      addVisualNotification(`Hot task switched to high-yield urgent card: ${job.id}`, true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitQC = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          status: 'QC Pending',
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        fetchLiveDashboardData();
        addVisualNotification(`Task completed & dispatched for Quality Checker review: ${taskId}`, false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUploadBase64 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTaskTarget || !tempImage64) return;

    try {
      const res = await fetch('/api/tasks/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: uploadTaskTarget.id,
          imageBase64: tempImage64,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        setUploadTaskTarget(null);
        setTempImage64('');
        fetchLiveDashboardData();
        addVisualNotification(`Visual proof image logged on card ${uploadTaskTarget.id}`, false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Render role text safely
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'ADMIN': return 'bg-amber-400/10 text-amber-300 border-amber-400/20';
      case 'QC': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35';
      case 'Waiting Approval': return 'bg-amber-500/15 text-amber-400 border-amber-500/35';
      case 'In Progress': return 'bg-blue-500/15 text-blue-400 border-blue-500/35';
      case 'Paused': return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/35';
      case 'Switched': return 'bg-purple-500/15 text-purple-400 border-purple-500/35';
      case 'QC Pending': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/35';
      case 'Rework': return 'bg-orange-500/15 text-orange-400 border-orange-500/35';
      case 'Cancelled': return 'bg-rose-500/15 text-rose-400 border-rose-500/35';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const getEmployeeHoverDetails = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return null;

    // Let's determine present status and current active job
    const unfinished = tasks.filter(t => t.assignedEmployeeId === emp.id && t.status !== 'Completed' && t.status !== 'Cancelled');
    const activeJobs = unfinished.filter(t => t.status === 'In Progress' || t.status === 'Rework');
    
    let statusText = 'Free ✨';
    let activeJobId = undefined;
    let activeJobType = undefined;

    if (emp.status === 'DISABLED') {
      statusText = 'Deactivated 🔴';
    } else if (emp.leaveStatus === 'ON_LEAVE') {
      statusText = 'On Leave 🌴';
    } else if (activeJobs.length > 0) {
      statusText = 'Working 🔴';
      activeJobId = activeJobs[0].id;
      activeJobType = activeJobs[0].jewelryType;
    } else if (unfinished.length > 0) {
      statusText = 'Idle (Paused) 🟡';
    }

    // Calculate Success Rate based on completes and delays
    const empCompleted = tasks.filter(t => t.assignedEmployeeId === emp.id && t.status === 'Completed');
    const empLate = empCompleted.filter(t => (t.actualTime || 0) > (t.approvedTime || t.estimatedTime || 0)).length;
    let successRate = emp.productivityScore || 85;
    if (empCompleted.length > 0) {
      successRate = Math.round(((empCompleted.length - empLate) / empCompleted.length) * 100);
    }

    return {
      fullName: emp.fullName,
      role: emp.role,
      status: statusText,
      successRate,
      currentJobId: activeJobId,
      currentJobType: activeJobType
    };
  };

  const handleSelectEmployee = (empOrId: any) => {
    if (!empOrId) return;
    if (typeof empOrId === 'string') {
      const found = employees.find(e => e.id === empOrId);
      if (found) {
        setInspectedEmployee(found);
      }
    } else {
      setInspectedEmployee(empOrId);
    }
  };

  const filteredSearchTasks = searchQuery ? (() => {
    const q = searchQuery.toLowerCase();
    const trackerSamples = [
      { id: 'JOB-DSN-101', customerName: 'Marcus Aurelius Sterling', jewelryType: 'Royal Signet Ring', materialType: '24K Fine Yellow Gold', assignedEmployeeName: 'Elena Rostova', status: 'Assigned', isExample: true },
      { id: 'JOB-CAD-202', customerName: 'Livia Drusilla', jewelryType: 'Emerald Halo Pendant', materialType: '18K White Gold Alloy', assignedEmployeeName: 'Dominic Thiem', status: 'Waiting Approval', isExample: true },
      { id: 'JOB-CST-303', customerName: 'Flavia Domitilla', jewelryType: 'Roman Twist Cufflinks', materialType: '22K Dark Amber Alloy', assignedEmployeeName: 'Marcus Vance', status: 'Approved', isExample: true },
      { id: 'JOB-SRT-404', customerName: 'Hadrian Caesar Augustus', jewelryType: 'Prong Solitaire Tennis Bracelet', materialType: '18K Platinum Blend', assignedEmployeeName: 'Sophia Chen', status: 'Accepted', isExample: true },
      { id: 'JOB-SET-505', customerName: 'Zenobia Palmyra', jewelryType: 'Bespoke Vintage Studs', materialType: '22K Soft Rose Gold', assignedEmployeeName: 'Arthur Pendelton', status: 'In Progress', isExample: true },
      { id: 'JOB-POL-606', customerName: 'Constantine the Great', jewelryType: 'Laurel Crown Ring', materialType: '24K Gold Leaf Overlay', assignedEmployeeName: 'Renato Rossi', status: 'Switched', isExample: true },
      { id: 'JOB-QCA-707', customerName: 'Theodora Byzantine Empress', jewelryType: 'Sovereign Choker Necklace', materialType: '18K Premium Gold Alloy', assignedEmployeeName: 'Clara Oswald', status: 'QC Pending', isExample: true },
      { id: 'JOB-VLT-808', customerName: 'Aurelian Sol Invictus', jewelryType: 'Palace Drop Earrings', materialType: '22K Fine Yellow Gold', assignedEmployeeName: 'Hassan Al-Sabbah', status: 'Completed', isExample: true }
    ];
    return [...tasks, ...trackerSamples].filter(task => {
      return (
        (task.id || '').toLowerCase().includes(q) ||
        (task.customerName || '').toLowerCase().includes(q) ||
        (task.jewelryType || '').toLowerCase().includes(q) ||
        (task.materialType || '').toLowerCase().includes(q) ||
        (task.assignedEmployeeName || '').toLowerCase().includes(q) ||
        (task.status || '').toLowerCase().includes(q)
      );
    });
  })() : [];

  const filteredSearchEmployees = searchQuery ? employees.filter(emp => {
    const q = searchQuery.toLowerCase();
    return (
      (emp.id || '').toLowerCase().includes(q) ||
      (emp.fullName || '').toLowerCase().includes(q) ||
      (emp.email || '').toLowerCase().includes(q) ||
      (emp.role || '').toLowerCase().includes(q) ||
      (emp.department || '').toLowerCase().includes(q) ||
      (emp.specialization || '').toLowerCase().includes(q)
    );
  }) : [];

  const handleHomeClick = () => {
    if (currentUser) {
      if (currentUser.role === 'EMPLOYEE') {
        setActiveTab('tasks');
      } else if (currentUser.role === 'QC') {
        setActiveTab('qc');
      } else {
        setActiveTab('dashboard');
      }
      setShowMobileMenu(false);
      setInspectedEmployee(null);
      setInspectedTask(null);
    }
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#04091a] text-slate-300 flex flex-col font-sans select-none relative pb-12">
      {/* Visual Ambient Gold Orbits */}
      <div className="absolute top-24 left-1/4 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(212,175,55,0.05)_0%,rgba(31,58,138,0.12)_40%,transparent_75%)] rounded-full blur-3xl pointer-events-none" />

      {/* Modern Luxury System Topbar Navigation */}
      <header className="bg-[#070e24]/85 backdrop-blur-xl border-b border-[#1f3460] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-40 sticky top-0 print:hidden shadow-lg shadow-black/30">
        <div 
          onClick={handleHomeClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-95 select-none group transition-all duration-200 shrink-0"
          title="Return to Home Dashboard"
        >
          <div className="p-2 bg-gradient-to-br from-[#1a1a1c] to-[#121214] border border-[#d4af37]/40 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.05)] group-hover:border-[#d4af37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all">
            <Gem className="h-5 w-5 text-[#d4af37] animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-widest text-white uppercase font-serif flex items-center gap-1.5 group-hover:text-[#f3e5ab] transition-colors">
              DIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f3e5ab] via-[#d4af37] to-[#aa7c11]">TRENDZ</span>
            </h1>
            <span className="text-[9px] uppercase tracking-wider text-gray-500 group-hover:text-gray-400 transition-colors">Gold & Diamonds Orchestration Portal</span>
          </div>
        </div>

        {/* Global Centralized Omnibox Search Bar */}
        <div className="w-full md:max-w-md relative flex-1" id="global-search-container">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search tasks, clients, alloys, artisans, specialists..."
              className="w-full bg-gray-950/95 border border-gray-800/80 focus:border-[#d4af37] text-xs rounded-xl pl-9 pr-9 py-2 text-white placeholder-gray-500 focus:outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Real-time search dropdown overlay matches */}
          {showSearchResults && searchQuery && (
            <div className="absolute left-0 right-0 mt-2 bg-[#121214] border border-[#d4af37]/30 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.85)] p-4 max-h-[420px] overflow-y-auto z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex justify-between items-center pb-2 mb-2.5 border-b border-gray-800">
                <span className="text-[10px] tracking-widest font-extrabold text-[#d4af37] uppercase">
                  UNIFIED SYSTEMS REPORT MATCHES
                </span>
                <span className="text-[9px] text-gray-500 font-mono">
                  Found: {filteredSearchTasks.length + filteredSearchEmployees.length}
                </span>
              </div>

              {filteredSearchTasks.length === 0 && filteredSearchEmployees.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No records matching &ldquo;<span className="text-gray-300 font-semibold">{searchQuery}</span>&rdquo; found.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Task matches */}
                  {filteredSearchTasks.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[9px] uppercase font-bold tracking-widest text-[#f3e5ab] px-1">
                        🛠️ Manufacturing Tasks ({filteredSearchTasks.length})
                      </div>
                      <div className="space-y-1">
                        {filteredSearchTasks.slice(0, 5).map(task => (
                          <div
                            key={task.id}
                            onClick={() => {
                              setTrackerSelectedJobId(task.id);
                              setActiveTab('tracker');
                              setShowSearchResults(false);
                            }}
                            className="p-2.5 rounded-xl bg-gray-955/65 hover:bg-[#1c1c1e] border border-gray-900 hover:border-gray-800 cursor-pointer transition text-left space-y-1 bg-gray-950/70"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-[#d4af37] font-mono font-bold">{task.id}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase ${getStatusColorClass(task.status)}`}>
                                {task.status}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-white truncate">
                              {task.jewelryType} &mdash; For {task.customerName}
                            </div>
                            <div className="text-[10px] text-gray-400 flex justify-between">
                              <span>Alloy: <b>{task.materialType}</b></span>
                              <span>Smith: <b className="text-[#f3e5ab]/90">{task.assignedEmployeeName}</b></span>
                            </div>
                          </div>
                        ))}
                        {filteredSearchTasks.length > 5 && (
                          <button
                            onClick={() => {
                              setActiveTab('tasks');
                              setShowSearchResults(false);
                            }}
                            className="w-full text-center text-[10px] text-[#d4af37] hover:underline pt-1"
                          >
                            + View all matched tasks in Tasks screen
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Employee matches */}
                  {filteredSearchEmployees.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-gray-850 border-gray-800/60">
                      <div className="text-[9px] uppercase font-bold tracking-widest text-[#f3e5ab] px-1">
                        👥 Artisan Crew & Specialists ({filteredSearchEmployees.length})
                      </div>
                      <div className="space-y-1">
                        {filteredSearchEmployees.slice(0, 5).map(emp => (
                          <div
                            key={emp.id}
                            onClick={() => {
                              setInspectedEmployee(emp);
                              setShowSearchResults(false);
                            }}
                            className="p-2.5 rounded-xl bg-gray-955/65 hover:bg-[#1c1c1e] border border-gray-900 hover:border-gray-800 cursor-pointer transition text-left flex justify-between items-center gap-2 bg-gray-950/70"
                          >
                            <div>
                              <div className="text-xs font-bold text-white leading-tight">{emp.fullName}</div>
                              <div className="text-[9px] text-gray-400 font-mono mt-0.5">{emp.id} &bull; {emp.department || 'General Bench'}</div>
                            </div>
                            <div className="text-right">
                              <span className="px-1.5 py-0.5 bg-gray-900 border border-gray-800 text-gray-300 rounded text-[8px] font-bold block uppercase tracking-wider">
                                {emp.role}
                              </span>
                              <span className="text-[8px] text-[#f3e5ab] block mt-0.5 uppercase tracking-wider font-semibold">{emp.skillLevel || 'Expert'}</span>
                            </div>
                          </div>
                        ))}
                        {filteredSearchEmployees.length > 5 && (
                          <button
                            onClick={() => {
                              setActiveTab('personnel');
                              setShowSearchResults(false);
                            }}
                            className="w-full text-center text-[10px] text-[#d4af37] hover:underline pt-1"
                          >
                            + Open directory folder for other team profiles
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Action Triggers & Roster Session Meta */}
        <div className="flex items-center gap-4">
          {/* Real-time system notifications dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              className="p-2 border border-gray-800 hover:border-[#d4af37]/45 rounded-xl bg-gray-950 text-gray-400 hover:text-white transition relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n=>n.urgent) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
              )}
            </button>

            {showNotificationPopup && (
              <div className="absolute right-0 mt-3 w-80 bg-[#121214] border border-[#d4af37]/35 rounded-2xl shadow-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-top-3 duration-200">
                <span className="text-[10px] tracking-wider text-[#d4af37] font-bold block uppercase border-b border-gray-800 pb-2 mb-2">
                  FACTORY YIELD TELEMETRY ALERTS
                </span>
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className="p-2.5 rounded-xl bg-[#161618] border border-gray-900 hover:border-[#d4af37]/45 hover:bg-gray-900/60 cursor-pointer transition duration-150 relative text-left group flex flex-col gap-1"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <p className={`text-[11px] leading-relaxed group-hover:text-white transition duration-150 ${n.urgent ? 'text-orange-400 font-semibold' : 'text-gray-300'}`}>
                          {n.text}
                        </p>
                        <span className="text-[8px] font-mono shrink-0 uppercase tracking-wider text-gray-500 bg-gray-950 px-1 py-0.5 rounded border border-gray-900 group-hover:border-[#d4af37]/30 group-hover:text-[#d4af37] transition duration-150">
                          {n.targetTab || 'view'}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-500 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Three-dots menu icon click to view mobile list */}
          <div className="md:hidden shrink-0">
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                showMobileMenu
                  ? 'border-[#d4af37] bg-[#d4af37]/10 text-white shadow-lg shadow-[#d4af37]/15'
                  : 'border-gray-800 hover:border-[#d4af37]/45 bg-[#0e0e10]/95 text-gray-400 hover:text-white'
              }`}
              title="Open Navigation Menu Options"
            >
              <MoreVertical className="w-4 h-4 text-[#d4af37]" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-950/80 border border-gray-800 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d4af37]/30 to-transparent flex items-center justify-center font-bold text-[10px] text-white">
              {currentUser.fullName[0]}
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-white block">{currentUser.fullName}</span>
              <span className={`text-[8px] font-bold px-1.5 rounded uppercase border inline-block leading-normal ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 px-3 border border-red-900/30 hover:border-red-500 rounded-xl bg-red-950/10 hover:bg-red-500 text-red-400 hover:text-black hover:font-bold transition text-xs flex items-center gap-1.5"
            title="Terminate Active session login"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile view expanded navigation tray */}
      {showMobileMenu && (
        <div className="md:hidden bg-[#121214] border border-[#d4af37]/30 rounded-2xl p-4 mb-2 mx-4 mt-4 shadow-xl text-left animate-in fade-in slide-in-from-top-4 duration-200 relative z-30">
          <div className="flex justify-between items-center pb-2 mb-3 border-b border-gray-800">
            <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest block">✦ Portal navigation ✦</span>
            <button 
              type="button"
              onClick={() => setShowMobileMenu(false)}
              className="p-1 hover:bg-gray-850 rounded text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {currentUser.role !== 'EMPLOYEE' && currentUser.role !== 'QC' && (
              <button
                type="button"
                onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }}
                className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                    : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" /> Dashboard
              </button>
            )}

            {currentUser.role !== 'EMPLOYEE' && currentUser.role !== 'QC' && (
              <button
                type="button"
                onClick={() => { setActiveTab('personnel'); setShowMobileMenu(false); }}
                className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                  activeTab === 'personnel'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                    : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" /> Crew Roster
              </button>
            )}

            {currentUser.role !== 'EMPLOYEE' && currentUser.role !== 'QC' && (
              <button
                type="button"
                onClick={() => { setActiveTab('tasks'); setShowMobileMenu(false); }}
                className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                  activeTab === 'tasks'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                    : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" /> Tasks Dispatch
              </button>
            )}

            {currentUser.role === 'EMPLOYEE' && (
              <button
                type="button"
                onClick={() => { setActiveTab('tasks'); setShowMobileMenu(false); }}
                className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                  activeTab === 'tasks'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                    : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" /> Assigned Tasks
              </button>
            )}

            <button
              type="button"
              onClick={() => { setActiveTab('leave'); setShowMobileMenu(false); }}
              className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                activeTab === 'leave'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                  : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" /> Staff Leaves
            </button>

            {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'QC') && (
              <button
                type="button"
                onClick={() => { setActiveTab('qc'); setShowMobileMenu(false); }}
                className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                  activeTab === 'qc'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                    : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 shrink-0" /> QC Inspection
              </button>
            )}

            {currentUser.role !== 'EMPLOYEE' && (
              <button
                type="button"
                onClick={() => { setActiveTab('analytics'); setShowMobileMenu(false); }}
                className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                    : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Activity className="w-3.5 h-3.5 shrink-0" /> Analytics
              </button>
            )}

            {currentUser.role !== 'EMPLOYEE' && (
              <button
                type="button"
                onClick={() => { setActiveTab('history'); setShowMobileMenu(false); }}
                className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                    : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <History className="w-3.5 h-3.5 shrink-0" /> Search Records
              </button>
            )}

            {currentUser.role !== 'EMPLOYEE' && (
              <button
                type="button"
                onClick={() => { setActiveTab('reports'); setShowMobileMenu(false); }}
                className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                  activeTab === 'reports'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                    : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" /> Material Logs
              </button>
            )}

            <button
              type="button"
              onClick={() => { setActiveTab('tracker'); setShowMobileMenu(false); }}
              className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                activeTab === 'tracker'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-md shadow-[#d4af37]/10'
                  : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Package className="w-3.5 h-3.5 shrink-0" /> Job Bag Locator
            </button>

            {currentUser.role === 'SUPER_ADMIN' && (
              <button
                type="button"
                onClick={() => { setActiveTab('settings'); setShowMobileMenu(false); }}
                className={`p-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-wider transition duration-150 flex items-center gap-2 border ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black border-[#d4af37] shadow-[#d4af37]/10 shadow'
                    : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Settings className="w-3.5 h-3.5 shrink-0" /> Settings
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace Frame container */}
      <div className="w-full max-w-full px-4 md:px-8 xl:px-12 pt-6 flex flex-col md:flex-row gap-6 print:block">
        {/* Real-time elegant Workspace sidebar navigators */}
        <aside className="hidden md:flex md:w-64 max-w-full shrink-0 flex-col gap-1.5 p-2 bg-[#121214]/90 backdrop-blur-md rounded-2xl border border-gray-900 justify-start print:hidden">
          {currentUser.role !== 'EMPLOYEE' && currentUser.role !== 'QC' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Unified Dashboard
            </button>
          )}

          {currentUser.role !== 'EMPLOYEE' && currentUser.role !== 'QC' && (
            <button
              onClick={() => setActiveTab('personnel')}
              className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'personnel'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Users className="w-4 h-4" /> Crew Roster Directory
            </button>
          )}

          {currentUser.role !== 'EMPLOYEE' && currentUser.role !== 'QC' && (
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'tasks'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Production Tasks Dispatch
            </button>
          )}

          {currentUser.role === 'EMPLOYEE' && (
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'tasks'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Briefcase className="w-4 h-4" /> My Assigned Tasks
            </button>
          )}

          <button
            onClick={() => setActiveTab('leave')}
            className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
              activeTab === 'leave'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Calendar className="w-4 h-4" /> Staff Leaves
          </button>

          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'QC') && (
            <button
              onClick={() => setActiveTab('qc')}
              className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'qc'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <CheckCircle className="w-4 h-4" /> Quality Inspection ({metrics.qcPendingJobs})
            </button>
          )}

          {currentUser.role !== 'EMPLOYEE' && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Activity className="w-4 h-4" /> Analytics
            </button>
          )}

          {currentUser.role !== 'EMPLOYEE' && (
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <History className="w-4 h-4" /> Index search Records
            </button>
          )}

          {currentUser.role !== 'EMPLOYEE' && (
            <button
               onClick={() => setActiveTab('reports')}
               className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                 activeTab === 'reports'
                   ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                   : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
               }`}
            >
              <FileText className="w-4 h-4" /> Material & Work Reports
            </button>
          )}

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
              activeTab === 'tracker'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Package className="w-4 h-4 font-bold" /> Spot Job Bag Locator
          </button>

          {currentUser.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 md:flex-none p-3 px-4 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Settings className="w-4 h-4" /> System Settings
            </button>
          )}
        </aside>

        {/* Dynamic Inner Panel View Router */}
        <main 
          className="flex-1 min-w-0 space-y-6"
          onMouseMove={(e) => {
            const target = (e.target as HTMLElement).closest('[data-hover-employee-id]');
            if (target) {
              const empId = target.getAttribute('data-hover-employee-id');
              if (empId) {
                const details = getEmployeeHoverDetails(empId);
                if (details) {
                  setHoverTooltip({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    ...details
                  });
                  return;
                }
              }
            }
            if (hoverTooltip?.visible) {
              setHoverTooltip(prev => prev ? { ...prev, visible: false } : null);
            }
          }}
          onMouseLeave={() => {
            if (hoverTooltip?.visible) {
              setHoverTooltip(prev => prev ? { ...prev, visible: false } : null);
            }
          }}
        >
          {/* Dashboard Summary Widgets */}
          {activeTab === 'dashboard' && currentUser.role !== 'EMPLOYEE' && currentUser.role !== 'QC' && (
            <div className="space-y-6">
              {/* Gold Counter Grid HUD */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setArtisanFilter(artisanFilter === 'BUSY' ? 'ALL' : 'BUSY')}
                  className={`p-5 rounded-2xl border transition-all duration-200 text-left relative overflow-hidden cursor-pointer select-none ${
                    artisanFilter === 'BUSY'
                      ? 'bg-[#1b120c] border-[#d4af37] shadow-lg shadow-[#d4af37]/10'
                      : 'bg-[#121214]/90 border-gray-900 hover:border-[#d4af37]/40 hover:bg-gray-800/10'
                  }`}
                  title="Click to view Active Working Bench Artisans"
                >
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Active bench-artisans</span>
                  <div className="text-3xl font-extrabold text-white mt-1.5 font-mono">{metrics.activeEmployees}</div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setArtisanFilter(artisanFilter === 'UNAVAILABLE' ? 'ALL' : 'UNAVAILABLE');
                    }}
                    className={`text-[10px] flex items-center gap-1 font-semibold mt-1.5 px-2 py-0.5 rounded-lg w-max transition ${
                      artisanFilter === 'UNAVAILABLE'
                        ? 'bg-blue-950/50 text-blue-400 border border-blue-900/40'
                        : 'text-emerald-400 hover:bg-gray-800/40'
                    }`}
                    title="Click to view vacation leave specialists"
                  >
                    ● {metrics.employeesOnLeave} on vacation leave
                  </div>
                </div>

                <div 
                  onClick={() => setDashboardTaskFilter(dashboardTaskFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
                  className={`p-5 rounded-2xl border transition-all duration-200 text-left relative overflow-hidden cursor-pointer select-none ${
                    dashboardTaskFilter === 'IN_PROGRESS'
                      ? 'bg-[#1b120c] border-[#d4af37] shadow-lg shadow-[#d4af37]/10'
                      : 'bg-[#121214]/90 border-gray-900 hover:border-[#d4af37]/40 hover:bg-gray-800/10'
                  }`}
                  title="Click to view In-Progress manufacturing jobs"
                >
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Active work in-progress</span>
                  <div className="text-3xl font-extrabold text-white mt-1.5 font-mono">{metrics.jobsInProgress}</div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDashboardTaskFilter(dashboardTaskFilter === 'WAITING_APPROVAL' ? 'ALL' : 'WAITING_APPROVAL');
                    }}
                    className={`text-[10px] flex items-center gap-1 font-semibold mt-1.5 px-2 py-0.5 rounded-lg w-max transition ${
                      dashboardTaskFilter === 'WAITING_APPROVAL'
                        ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                        : 'text-[#d4af37] hover:bg-gray-800/40'
                    }`}
                    title="Click to view jobs waiting estimation hours authorization"
                  >
                    ● {metrics.pendingApprovals} awaiting approvals
                  </div>
                </div>

                <div 
                  onClick={() => setDashboardTaskFilter(dashboardTaskFilter === 'DELAYED' ? 'ALL' : 'DELAYED')}
                  className={`p-5 rounded-2xl border transition-all duration-200 text-left relative overflow-hidden cursor-pointer select-none ${
                    dashboardTaskFilter === 'DELAYED'
                      ? 'bg-rose-950/25 border-red-500/80 shadow-lg shadow-red-500/15'
                      : 'bg-[#121214]/90 border-gray-900 hover:border-red-500/40 hover:bg-rose-950/5'
                  }`}
                  title="Click to view Overdue/Delayed manufacturing jobs"
                >
                  <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold block">Delinquent / Delayed Jobs</span>
                  <div className="text-3xl font-extrabold text-red-500 mt-1.5 font-mono">{metrics.delayedJobs}</div>
                  <div className="text-[10px] text-red-400/70 flex items-center gap-1 font-semibold mt-1.5">
                    ⚠ Auto computed via timelines
                  </div>
                </div>

                <div 
                  onClick={() => setDashboardTaskFilter(dashboardTaskFilter === 'URGENT' ? 'ALL' : 'URGENT')}
                  className={`p-5 rounded-2xl border transition-all duration-200 text-left relative overflow-hidden cursor-pointer select-none ${
                    dashboardTaskFilter === 'URGENT'
                      ? 'bg-orange-950/25 border-orange-500/80 shadow-lg shadow-orange-500/15'
                      : 'bg-[#121214]/90 border-gray-900 hover:border-orange-550/40 hover:bg-orange-950/5'
                  }`}
                  title="Click to view Urgent priority jobs"
                >
                  <span className="text-[10px] text-[#f3e5ab] uppercase tracking-widest font-bold block">Urgent Priority Ques</span>
                  <div className="text-3xl font-extrabold text-orange-500 mt-1.5 font-mono">{metrics.urgentTasks}</div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDashboardTaskFilter(dashboardTaskFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED');
                    }}
                    className={`text-[10px] flex items-center gap-1 mt-1.5 font-mono px-2 py-0.5 rounded-lg w-max transition ${
                      dashboardTaskFilter === 'COMPLETED'
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                    }`}
                    title="Click to view completed jobs"
                  >
                    Completed Today: {metrics.completedToday}
                  </div>
                </div>
              </div>

              {/* Real-time Interactive Analytics, Live Gold Tracker and Valuation Grid */}
              <ModernAnalytics tasks={tasks} onSelectEmployee={handleSelectEmployee} />

              {/* Dynamic Workbench Monitor and Artisan Status Side-by-Side Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Column 1 & 2: Live Manufacturing Workbench Monitoring */}
                <div className="xl:col-span-2 p-6 bg-[#121214]/95 border border-gray-900 rounded-3xl text-left space-y-4 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 border-b border-gray-800 gap-3">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">Live Manufacturing Workbench Monitoring</h3>
                      <p className="text-[10px] text-gray-400">Review status logs, approve incoming artisan estimated completion hours, and view yield counters.</p>
                    </div>
                    <button
                      onClick={fetchLiveDashboardData}
                      className="p-1 px-3.5 text-xs text-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37] rounded-xl hover:bg-[#d4af37]/5 font-semibold transition self-end md:self-auto"
                    >
                      Refresh
                    </button>
                  </div>

                  {/* Quick Filters Pill Bar */}
                  <div className="flex flex-wrap gap-1.5 bg-gray-950/80 p-1.5 rounded-xl border border-gray-900 overflow-x-auto">
                    {[
                      { id: 'ALL', label: 'All Jobs', count: tasks.length },
                      { id: 'IN_PROGRESS', label: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length },
                      { id: 'WAITING_APPROVAL', label: 'Awaiting Hours', count: tasks.filter(t => t.status === 'Waiting Approval').length },
                      { id: 'QC_PENDING', label: 'QC Pending', count: tasks.filter(t => t.status === 'QC Pending').length },
                      { id: 'COMPLETED', label: 'Completed', count: tasks.filter(t => t.status === 'Completed').length },
                      { id: 'DELAYED', label: 'Overdue / Delayed', count: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled' && new Date(t.dueDate).getTime() < Date.now()).length, badgeColor: 'text-red-400' },
                      { id: 'URGENT', label: 'Urgent Priority', count: tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length, badgeColor: 'text-orange-400' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setDashboardTaskFilter(f.id as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-wide uppercase transition ${
                          dashboardTaskFilter === f.id
                            ? 'bg-[#d4af37] text-black shadow-sm'
                            : 'bg-gray-900 border border-gray-805 text-gray-400 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`px-1.5 py-0.2 select-none font-mono text-[9px] rounded-md ${
                          dashboardTaskFilter === f.id 
                            ? 'bg-black/20 text-black' 
                            : f.badgeColor || 'bg-gray-950 text-gray-500'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                    {(() => {
                      const filteredDashboardTasks = tasks.filter(job => {
                        if (dashboardTaskFilter === 'ALL') return true;
                        if (dashboardTaskFilter === 'IN_PROGRESS') return job.status === 'In Progress';
                        if (dashboardTaskFilter === 'WAITING_APPROVAL') return job.status === 'Waiting Approval';
                        if (dashboardTaskFilter === 'QC_PENDING') return job.status === 'QC Pending';
                        if (dashboardTaskFilter === 'COMPLETED') return job.status === 'Completed';
                        if (dashboardTaskFilter === 'DELAYED') {
                          return job.status !== 'Completed' && job.status !== 'Cancelled' && new Date(job.dueDate).getTime() < Date.now();
                        }
                        if (dashboardTaskFilter === 'URGENT') {
                          return job.priority === 'Urgent' && job.status !== 'Completed';
                        }
                        return true;
                      });

                      if (filteredDashboardTasks.length === 0) {
                        return (
                          <div className="py-12 text-center text-gray-500 text-xs">
                            No manufacturing jobs match the current filter filter.
                          </div>
                        );
                      }

                      return filteredDashboardTasks.map((job) => (
                        <div key={job.id} className="p-4 bg-gray-950/70 border border-gray-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[#d4af37] font-mono font-bold">{job.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColorClass(job.status)}`}>
                                {job.status}
                              </span>
                              {job.priority === 'Urgent' && (
                                <span className="bg-red-950 text-red-400 text-[9px] px-1.5 py-0.5 rounded font-bold border border-red-500/30 animate-pulse">URGENT</span>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-white mt-1">{job.jewelryType} — For {job.customerName}</h4>
                            <p className="text-xs text-gray-400">Material alloy: <b>{job.materialType} • {job.goldWeight}g</b> • Due: <b>{job.dueDate}</b></p>
                            <div 
                              onClick={() => handleSelectEmployee(job.assignedEmployeeId)}
                              data-hover-employee-id={job.assignedEmployeeId}
                              className="text-[11px] mt-1.5 text-[#f3e5ab] hover:text-[#d4af37] transition cursor-pointer inline-flex items-center gap-1.5 bg-[#161618] px-2.5 py-1 rounded-lg border border-gray-900 hover:border-[#d4af37]/35"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Specialist: <b className="underline underline-offset-2">{job.assignedEmployeeName}</b></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-2 border-gray-800/60">
                            {/* Time stats */}
                            <div className="text-right text-[11px] font-mono">
                              <div>Est: <span className="text-amber-400">{job.estimatedTime}h</span></div>
                              <div>Appr: <span className="text-emerald-400">{job.approvedTime}h</span></div>
                              <div>Act: <span className="text-blue-400">{job.actualTime}h</span></div>
                            </div>

                            {/* Action controllers */}
                            <div className="flex gap-2">
                              {job.status === 'Waiting Approval' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setApprovingTask(job);
                                    setTempApprovedHours(job.estimatedTime);
                                  }}
                                  className="p-1 px-3 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black text-xs font-bold rounded-xl hover:brightness-110"
                                >
                                  Approve Estimate
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Column 3: Live Artisan Bench Status (Busy vs. Free) */}
                <div className="p-6 bg-[#121214]/95 border border-gray-900 rounded-3xl text-left space-y-4 shadow-xl flex flex-col justify-start">
                  <div className="pb-3 border-b border-gray-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#d4af37]" /> Live Artisan Bench Status
                    </h3>
                    <p className="text-[10px] text-gray-400">Real-time tracking of active-working specialists and available/free bench crew members.</p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="grid grid-cols-4 gap-1 bg-gray-950 p-1 rounded-xl">
                    <button
                      onClick={() => setArtisanFilter('ALL')}
                      className={`py-1.5 rounded-lg text-[9px] font-extrabold transition uppercase ${
                        artisanFilter === 'ALL' ? 'bg-[#d4af37] text-black font-extrabold shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setArtisanFilter('BUSY')}
                      className={`py-1.5 rounded-lg text-[9px] font-extrabold transition uppercase ${
                        artisanFilter === 'BUSY' ? 'bg-red-500 text-black font-extrabold shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      BUSY
                    </button>
                    <button
                      onClick={() => setArtisanFilter('FREE')}
                      className={`py-1.5 rounded-lg text-[9px] font-extrabold transition uppercase ${
                        artisanFilter === 'FREE' ? 'bg-emerald-500 text-black font-extrabold shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      FREE
                    </button>
                    <button
                      onClick={() => setArtisanFilter('UNAVAILABLE')}
                      className={`py-1.5 rounded-lg text-[9px] font-extrabold transition uppercase ${
                        artisanFilter === 'UNAVAILABLE' ? 'bg-indigo-500 text-white font-extrabold shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      VACANT
                    </button>
                  </div>

                  {/* Computed List */}
                  <div className="space-y-2.5 overflow-y-auto max-h-[400px] flex-1 pr-1">
                    {(() => {
                      const employeeList = employees.filter(e => e.role === 'EMPLOYEE');
                      
                      const calculatedArtisans = employeeList.map(emp => {
                        const unfinishedTasks = tasks.filter(t => t.assignedEmployeeId === emp.id && t.status !== 'Completed' && t.status !== 'Cancelled');
                        const activeTasks = unfinishedTasks.filter(t => t.status === 'In Progress' || t.status === 'Rework');
                        
                        let statusType: 'BUSY' | 'FREE' | 'UNAVAILABLE' = 'FREE';
                        let statusLabel = 'Free (No Work) ✨';
                        let statusColor = 'bg-[#0f241a] text-[#4ade80] border-[#1b4332]';
                        let iconColor = 'bg-green-400';
                        let activeTaskObj = null;

                        if (emp.status === 'DISABLED') {
                          statusType = 'UNAVAILABLE';
                          statusLabel = 'Disabled';
                          statusColor = 'bg-zinc-800 text-zinc-500 border-zinc-900';
                        } else if (emp.leaveStatus === 'ON_LEAVE') {
                          statusType = 'UNAVAILABLE';
                          statusLabel = 'On Leave 🌴';
                          statusColor = 'bg-blue-950/40 text-blue-400 border-blue-900/40';
                        } else if (activeTasks.length > 0) {
                          statusType = 'BUSY';
                          statusLabel = 'WORKING 🔴';
                          statusColor = 'bg-red-950/40 text-red-400 border-red-900/50';
                          activeTaskObj = activeTasks[0];
                        } else if (unfinishedTasks.length > 0) {
                          // Has assigned pending tasks but they are currently paused / accepted / waiting
                          statusType = 'FREE';
                          statusLabel = 'Idle (Paused Work) 🟡';
                          statusColor = 'bg-amber-950/40 text-amber-400 border-amber-900/50';
                          activeTaskObj = unfinishedTasks[0];
                        }

                        return {
                          ...emp,
                          statusType,
                          statusLabel,
                          statusColor,
                          activeTaskObj,
                          pendingCount: unfinishedTasks.length
                        };
                      });

                      const filteredArtisans = calculatedArtisans.filter(art => {
                        if (artisanFilter === 'ALL') return true;
                        return art.statusType === artisanFilter;
                      });

                      if (filteredArtisans.length === 0) {
                        return (
                          <div className="py-12 text-center text-gray-500 text-xs">
                            No craftsmen match the current filter.
                          </div>
                        );
                      }

                      return filteredArtisans.map((art) => (
                        <div 
                          key={art.id} 
                          onClick={() => handleSelectEmployee(art)}
                          data-hover-employee-id={art.id}
                          className="p-3 bg-gray-950/80 border border-gray-905 rounded-2xl flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:border-[#d4af37]/45 hover:bg-gray-800/10 transition text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-[#d4af37] transition">{art.fullName}</div>
                              <div className="text-[10px] text-gray-500 font-mono mt-0.5">{art.id} • {art.department || 'General Bench'}</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] tracking-wider uppercase font-extrabold border ${art.statusColor}`}>
                              {art.statusLabel}
                            </span>
                          </div>

                          {art.statusType === 'BUSY' && art.activeTaskObj && (
                            <div className="p-2 rounded bg-red-950/10 border border-red-950/30 text-[10px] text-zinc-400">
                              <span className="text-[8px] uppercase tracking-wider text-red-400 block font-bold font-mono">Running Task:</span>
                              Working on <b className="text-white">{art.activeTaskObj.id}</b> ({art.activeTaskObj.jewelryType}) for <i>{art.activeTaskObj.customerName}</i>
                            </div>
                          )}

                          {art.statusType === 'FREE' && art.pendingCount > 0 && art.activeTaskObj && (
                            <div className="p-2 rounded bg-amber-950/10 border border-amber-950/30 text-[10px] text-zinc-400">
                              <span className="text-[8px] uppercase tracking-wider text-amber-400 block font-bold font-mono">Standby ({art.pendingCount} queued):</span>
                              Assigned task <b className="text-[#f3e5ab]">{art.activeTaskObj.id}</b> is currently <span className="font-semibold text-amber-500">{art.activeTaskObj.status}</span>
                            </div>
                          )}

                          {art.statusType === 'FREE' && art.pendingCount === 0 && (
                            <div className="p-2 rounded bg-[#0f241a]/10 border border-[#1b4332]/40 text-[10px] text-emerald-400/90 flex items-center gap-1.5 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Completely free. Ready for new jobs.</span>
                            </div>
                          )}

                          {art.statusType === 'UNAVAILABLE' && (
                            <div className="p-2 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-500">
                              Temporarily off the workshop catalog directory.
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personnel' && (
            <EmployeeForm currentUser={currentUser} onRefreshMetrics={fetchLiveDashboardData} onSelectEmployee={handleSelectEmployee} />
          )}

          {activeTab === 'tasks' && currentUser.role !== 'EMPLOYEE' && (
            <div className="space-y-6">
              <TaskForm currentUser={currentUser} onRefreshTasks={fetchLiveDashboardData} />
            </div>
          )}

          {/* Employee Workbench Tasks Panel ONLY */}
          {activeTab === 'tasks' && currentUser.role === 'EMPLOYEE' && (
            <div className="p-6 bg-[#121214]/95 border border-gray-900 rounded-3xl text-left space-y-6">
              <div className="pb-3 border-b border-gray-800">
                <h3 className="text-md font-bold uppercase tracking-widest text-[#f3e5ab]">My Bench Manufacturing Job Roster</h3>
                <p className="text-[10px] text-gray-400">Accept assigned diamond casting frames, set estimation timelines, record task switching, pause reason tracking, and sign-off inward checks.</p>
              </div>

              {tasks.filter(t => t.assignedEmployeeId === currentUser.id).length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  No active production layouts mapped to your secure employee ID file.
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.filter(t => t.assignedEmployeeId === currentUser.id).map((job) => (
                    <div key={job.id} className="p-5 bg-gray-950 rounded-2xl border border-gray-800 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#d4af37] font-mono font-bold">{job.id} • {job.taskId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColorClass(job.status)}`}>
                              {job.status}
                            </span>
                          </div>
                          <h4 className="text-base font-serif font-extrabold text-white mt-1">{job.jewelryType} — {job.customerName}</h4>
                          <p className="text-xs text-gray-400 mt-1">Material guidelines: <b>{job.materialType} • {job.goldWeight}g</b> • Remark: {job.remarks}</p>
                          <p className="text-xs text-[#d4af37] mt-1 font-bold">Estimated hours limit: {job.approvedTime > 0 ? `${job.approvedTime} APPROVED Hours` : 'AWATING ADMIN APPROVAL'}</p>
                        </div>

                        {/* Workbench triggers */}
                        <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                          {job.status === 'Assigned' && (
                            <button
                              onClick={() => handleAcceptTask(job.id)}
                              className="p-2 px-4 bg-[#1a1a1c] hover:bg-gray-800 border border-[#d4af37]/35 text-[#d4af37] hover:text-white rounded-xl text-xs font-semibold"
                            >
                              Accept Task
                            </button>
                          )}

                          {job.status === 'Accepted' && (
                            <button
                              onClick={() => {
                                setSelectedTaskForEstimate(job);
                                setTempHoursEstimate(8);
                              }}
                              className="p-2 px-4 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black text-xs font-bold rounded-xl"
                            >
                              Enter hours Estimate
                            </button>
                          )}

                          {job.status === 'Approved' && (
                            <button
                              onClick={() => handleStartTask(job.id)}
                              className="p-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5" /> Start Task
                            </button>
                          )}

                          {job.status === 'In Progress' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedTaskForPause(job);
                                  setTempPauseReason('');
                                }}
                                className="p-2 px-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                              >
                                <Pause className="w-3.5 h-3.5" /> Pause
                              </button>

                              <button
                                onClick={() => handleSubmitQC(job.id)}
                                className="p-2 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                              >
                                <CheckSquare className="w-3.5 h-3.5" /> Submit to QC
                              </button>
                            </>
                          )}

                          {(job.status === 'Paused' || job.status === 'Switched' || job.status === 'Rework') && (
                            <button
                              onClick={() => handleStartTask(job.id)}
                              className="p-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                            >
                              Resume work
                            </button>
                          )}

                          {/* Quick hot task switch trigger for active urgent jobs */}
                          {job.priority === 'Urgent' && job.status !== 'In Progress' && job.status !== 'Completed' && job.status !== 'QC Pending' && (
                            <button
                              onClick={() => handleSwitchTask(job)}
                              className="p-2 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl animate-pulse"
                            >
                              ⚡ SWITCH ACTIVE WORK
                            </button>
                          )}

                          {/* Proof Upload Frame toggle */}
                          <button
                            onClick={() => {
                              setUploadTaskTarget(job);
                              setTempImage64('');
                            }}
                            className="p-2 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs hover:border-[#d4af37]"
                            title="Attach work progress frames"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Display active workflow history logs */}
                      {job.timeline && job.timeline.length > 0 && (
                        <div className="pt-3 border-t border-gray-900 text-[10px] text-gray-500 space-y-1">
                          <span className="font-bold uppercase tracking-widest text-[#d4af37]">ACTIVE STATUS LOG:</span>
                          <div className="flex gap-2.5 flex-wrap">
                            {job.timeline.slice(-3).map((evt, idx) => (
                              <span key={idx} className="bg-gray-900/60 p-1 rounded px-2">
                                <b>{evt.status}</b> ({new Date(evt.timestamp).toLocaleTimeString()})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leave' && (
            <LeaveCalendar currentUser={currentUser} onRefreshMetrics={fetchLiveDashboardData} />
          )}

          {activeTab === 'qc' && (
            <QCModule currentUser={currentUser} onRefreshMetrics={fetchLiveDashboardData} onSelectEmployee={handleSelectEmployee} />
          )}

          {activeTab === 'analytics' && currentUser.role !== 'EMPLOYEE' && (
            <PerformanceRankings onSelectEmployee={handleSelectEmployee} />
          )}

          {activeTab === 'history' && currentUser.role !== 'EMPLOYEE' && (
            <HistoricalSearch currentUser={currentUser} onSelectEmployee={handleSelectEmployee} />
          )}

          {activeTab === 'reports' && currentUser.role !== 'EMPLOYEE' && (
            <WorkReports currentUser={currentUser} onSelectEmployee={handleSelectEmployee} />
          )}

          {activeTab === 'settings' && currentUser.role === 'SUPER_ADMIN' && (
            <SuperAdminSettings currentUser={currentUser} onRefreshMetrics={fetchLiveDashboardData} />
          )}

          {activeTab === 'tracker' && (
            <JobBagTracker 
              tasks={tasks} 
              onSelectEmployee={handleSelectEmployee} 
              selectedTrackerJobId={trackerSelectedJobId}
              onSelectTrackerJobId={setTrackerSelectedJobId}
            />
          )}
        </main>
      </div>

      {/* MODAL WINDOWS GROUP */}

      {/* Enter Hour Estimates Modal Popup form */}
      {selectedTaskForEstimate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-left">
          <div className="bg-[#121214]/95 border border-[#d4af37]/35 rounded-2xl w-full max-w-sm p-6 overflow-hidden shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-[#f3e5ab] uppercase">Declare workbench Hour Estimate</h3>
            <p className="text-xs text-gray-400">Specify completion hours for gold carving or setting processes.</p>

            <form onSubmit={handleSubmitEstimate} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Casting & Setting design Hours</label>
                <input
                  type="number"
                  value={tempHoursEstimate}
                  onChange={(e) => setTempHoursEstimate(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-xl text-xs p-3 text-white font-mono"
                  placeholder="E.g. 12"
                  min={1}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForEstimate(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl font-semibold"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d4af37] text-black font-semibold rounded-xl"
                >
                  Submit Estimate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Approve hours limit Modal Selector Form */}
      {approvingTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-left">
          <div className="bg-[#121214]/95 border border-[#d4af37]/35 rounded-2xl w-full max-w-sm p-6 overflow-hidden shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-white uppercase">Approve manufacturing timeline Hours</h3>
            <p className="text-xs text-gray-400">Review artisan's requested estimate: <b>{approvingTask.estimatedTime} Hours</b></p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Approved Gold Smith Hours allocate</label>
                <input
                  type="number"
                  value={tempApprovedHours}
                  onChange={(e) => setTempApprovedHours(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-xl text-xs p-3 text-white font-mono"
                  min={1}
                />
              </div>

               <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setApprovingTask(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl font-semibold hover:bg-gray-700 hover:text-white transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminReviewEstimate('approve')}
                  className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-semibold rounded-xl hover:brightness-110 transition shadow-md shadow-[#d4af37]/20"
                >
                  Authorize Hours
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Artisan Pause Reason logs input capture frame */}
      {selectedTaskForPause && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-left">
          <div className="bg-[#121214]/95 border border-red-900/35 rounded-2xl w-full max-w-sm p-6 overflow-hidden shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-white uppercase">Record Interruption / Pause Cause</h3>
            <p className="text-xs text-gray-400">Timeline interruptions require database categorization logging.</p>

            <form onSubmit={handlePauseTask} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Stated Switch/Pause Reason</label>
                <textarea
                  value={tempPauseReason}
                  onChange={(e) => setTempPauseReason(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-xl text-xs p-3 text-white"
                  rows={3}
                  placeholder="Need to prioritize urgent Tiffany Necklace casting work, waiting for platinum alloy delivery..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForPause(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-xl"
                >
                  Pause workbench Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Upload/Macro photo Modal Form */}
      {uploadTaskTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-left">
          <div className="bg-[#121214]/95 border border-[#d4af37]/35 rounded-2xl w-full max-w-sm p-6 overflow-hidden shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-white uppercase">Upload Production photo proof</h3>
            <p className="text-xs text-gray-400">Attach macro casting or setting frames reference to card <b>{uploadTaskTarget.id}</b></p>

            <form onSubmit={handleImageUploadBase64} className="space-y-4">
              <div className="border border-dashed border-gray-800 rounded-xl p-6 bg-[#18181a] hover:bg-[#1c1c1e] text-center cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {tempImage64 ? (
                  <div className="space-y-2">
                    <img src={tempImage64} alt="Pre-upload" className="max-h-24 mx-auto object-cover rounded" />
                    <span className="text-[10px] text-emerald-400 block font-bold">Image Frame staged successfully</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Upload className="w-5 h-5 mx-auto text-[#d4af37]" />
                    <span className="text-xs text-gray-400 block">Click or Select high macro camera capture artifact</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadTaskTarget(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl font-semibold"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold rounded-xl"
                  disabled={!tempImage64}
                >
                  Log Evidence Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Result Task Quick Inspector Modal */}
      {inspectedTask && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-center items-center p-4 text-left overflow-y-auto">
          <div className="bg-[#121214] border border-[#d4af37]/35 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 relative my-8">
            <button
              onClick={() => setInspectedTask(null)}
              className="absolute top-5 right-5 p-1.5 border border-gray-800 hover:border-[#d4af37]/40 text-gray-500 hover:text-white rounded-xl bg-gray-950 transition"
              title="Close Dossier"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-gray-800 pb-4">
              <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-mono font-bold block mb-1">
                Manufacturing Job Card Dossier
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl font-serif font-extrabold text-white">{inspectedTask.id}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getStatusColorClass(inspectedTask.status)}`}>
                  {inspectedTask.status}
                </span>
                {inspectedTask.priority === 'Urgent' && (
                  <span className="bg-red-950 text-red-400 text-[9px] px-2 py-0.5 rounded-full font-bold border border-red-500/30 animate-pulse">
                    URGENT DISPATCH
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Layout Details Slot */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f3e5ab] border-b border-gray-900 pb-1">
                  Layout Guidelines
                </h4>
                <div className="grid grid-cols-2 gap-3.5 text-xs text-left">
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Client Sponsor</span>
                    <span className="text-white font-semibold truncate block">{inspectedTask.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Jewelry Category</span>
                    <span className="text-white font-semibold">{inspectedTask.jewelryType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Material Alloy</span>
                    <span className="text-white font-semibold">{inspectedTask.materialType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Gold GoldWeight</span>
                    <span className="text-[#f3e5ab] font-mono font-semibold">{inspectedTask.goldWeight} grams</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Complexity Level</span>
                    <span className="text-white font-semibold">{inspectedTask.complexityLevel}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Calendar Due Date</span>
                    <span className="text-amber-400 font-mono font-semibold">{inspectedTask.dueDate}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-left">
                  <span className="text-gray-500 block text-[9px] uppercase font-bold mb-0.5">Assigned Specialist Smith</span>
                  <div className="p-2 bg-gray-950 border border-gray-900 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-white block text-left">{inspectedTask.assignedEmployeeName}</span>
                      <span className="text-[9px] text-[#f3e5ab]/80 font-mono block text-left">{inspectedTask.assignedEmployeeId}</span>
                    </div>
                    {currentUser.role !== 'EMPLOYEE' && (
                      <button
                        onClick={() => {
                          const targetEmp = employees.find(e => e.id === inspectedTask.assignedEmployeeId);
                          if (targetEmp) setInspectedEmployee(targetEmp);
                          setInspectedTask(null);
                        }}
                        className="p-1 px-2 border border-gray-800 hover:border-[#d4af37] text-[9px] text-gray-400 hover:text-white rounded bg-gray-900 transition flex items-center gap-1"
                      >
                        <User className="w-3 h-3" /> Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-950/70 border border-gray-900 rounded-xl text-xs space-y-1 text-left">
                  <span className="text-gray-500 block text-[9px] uppercase font-bold">Design Instructions & Memo</span>
                  <p className="text-gray-300 italic">
                    &ldquo;{inspectedTask.remarks || 'No detailed bench remarks logged yet.'}&rdquo;
                  </p>
                </div>

                {/* Hours Tracker HUD */}
                <div className="p-3 bg-amber-950/10 border border-[#d4af37]/15 rounded-xl grid grid-cols-3 gap-2 text-center text-xs font-mono w-full">
                  <div>
                    <span className="text-gray-500 block text-[8px] uppercase font-bold text-center">ESTIMATED</span>
                    <span className="text-amber-400 font-bold block mt-0.5">{inspectedTask.estimatedTime} hr</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[8px] uppercase font-bold text-center">APPROVED</span>
                    <span className="text-emerald-400 font-bold block mt-0.5">{inspectedTask.approvedTime} hr</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[8px] uppercase font-bold text-center">FABRICATED</span>
                    <span className="text-blue-400 font-bold block mt-0.5">{inspectedTask.actualTime} hr</span>
                  </div>
                </div>
              </div>

              {/* Status Action LOG & Event Timeline Trail */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f3e5ab] border-b border-gray-900 pb-1 flex items-center justify-between">
                  <span>Manufacturing Workflow Timeline</span>
                  <span className="text-[9px] text-gray-500 font-mono">{inspectedTask.timeline?.length || 0} events</span>
                </h4>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 text-left">
                  {inspectedTask.timeline && inspectedTask.timeline.length > 0 ? (
                    inspectedTask.timeline.map((evt, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-gray-950 border border-gray-900 text-left space-y-1 relative">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-[#d4af37] tracking-wide">{evt.status}</span>
                          <span className="text-gray-500 font-mono text-[9px]">
                            {new Date(evt.timestamp).toLocaleDateString()} {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Triggered by: <b className="text-gray-300">{evt.user}</b> {evt.payload && <span className="text-emerald-400 block font-mono mt-0.5">Payload: {evt.payload}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-500 italic">
                      No status events logs.
                    </div>
                  )}
                </div>

                {/* Inside-Modal Actions Group */}
                <div className="pt-2 border-t border-gray-900 space-y-2">
                  <span className="text-gray-500 block text-[8px] uppercase font-bold text-left">Fast-track controller actions</span>
                  
                  <div className="flex flex-wrap gap-2 text-left">
                    {/* Admin approving estimated hours directly */}
                    {inspectedTask.status === 'Waiting Approval' && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
                      <button
                        onClick={() => {
                          setApprovingTask(inspectedTask);
                          setTempApprovedHours(inspectedTask.estimatedTime);
                          setInspectedTask(null);
                        }}
                        className="py-1.5 px-3 bg-[#d4af37] hover:brightness-110 text-black text-xs font-bold rounded-xl flex-1 text-center transition"
                      >
                        Approve Estimate Hours
                      </button>
                    )}

                    {/* Employee accepting assignment */}
                    {inspectedTask.status === 'Assigned' && currentUser.id === inspectedTask.assignedEmployeeId && (
                      <button
                        onClick={() => {
                          handleAcceptTask(inspectedTask.id);
                          setInspectedTask(null);
                        }}
                        className="py-1.5 px-3 bg-[#d4af37] hover:brightness-110 text-black text-xs font-bold rounded-xl flex-1 text-center transition"
                      >
                        Accept Assigned Job
                      </button>
                    )}

                    {/* Employee submitting estimated hour timelines */}
                    {inspectedTask.status === 'Accepted' && currentUser.id === inspectedTask.assignedEmployeeId && (
                      <button
                        onClick={() => {
                          setSelectedTaskForEstimate(inspectedTask);
                          setTempHoursEstimate(8);
                          setInspectedTask(null);
                        }}
                        className="py-1.5 px-3 bg-[#d4af37] hover:brightness-110 text-black text-xs font-bold rounded-xl flex-1 text-center transition"
                      >
                        Declare Est. Limit Hours
                      </button>
                    )}

                    {/* Employee launching work */}
                    {inspectedTask.status === 'Approved' && currentUser.id === inspectedTask.assignedEmployeeId && (
                      <button
                        onClick={() => {
                          handleStartTask(inspectedTask.id);
                          setInspectedTask(null);
                        }}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex-1 text-center transition"
                      >
                        Launch Fabrication Work
                      </button>
                    )}

                    {/* Switching active workspace tab shortcut */}
                    <button
                      onClick={() => {
                        setActiveTab('tasks');
                        setInspectedTask(null);
                      }}
                      className="py-1.5 px-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 flex-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" /> Open in Workbench Screen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Result Employee Profile Quick Inspector Modal */}
      {inspectedEmployee && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-center items-center p-4 text-left overflow-y-auto">
          <div className="bg-[#121214] border border-[#d4af37]/35 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setInspectedEmployee(null)}
              className="absolute top-5 right-5 p-1.5 border border-gray-800 hover:border-[#d4af37]/40 text-gray-500 hover:text-white rounded-xl bg-gray-950 transition"
              title="Close Dossier"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa7c11] text-black flex items-center justify-center text-lg font-extrabold uppercase shadow-lg select-all">
                {inspectedEmployee.fullName.split(' ').map((n: string)=>n[0]).join('')}
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-mono font-bold block mb-0.5">
                  Artisan Database Profile
                </span>
                <h3 className="text-base font-serif font-extrabold text-white leading-tight">
                  {inspectedEmployee.fullName}
                </h3>
                <span className="text-[9px] bg-gray-950 border border-gray-805 text-gray-400 font-mono px-1.5 py-0.5 rounded mr-1 border-gray-800">
                  ID: {inspectedEmployee.id}
                </span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border inline-block ${getRoleBadgeColor(inspectedEmployee.role)}`}>
                  {inspectedEmployee.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#f3e5ab] border-b border-gray-900 pb-1">
                  Professional Profile Metadata
                </h4>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Secure Email</span>
                    <span className="text-white font-semibold truncate block">{inspectedEmployee.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Phone Number</span>
                    <span className="text-white font-semibold">{inspectedEmployee.phone || 'No registered phone'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Manufacturing Dept</span>
                    <span className="text-white font-semibold">{inspectedEmployee.department || 'All Benches'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Design Specialization</span>
                    <span className="text-white font-semibold">{inspectedEmployee.specialization || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Skill Category</span>
                    <span className="text-white font-semibold">{inspectedEmployee.skillLevel || 'Expert'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Joining File Date</span>
                    <span className="text-gray-300 font-mono">{inspectedEmployee.joiningDate}</span>
                  </div>
                </div>
              </div>

              {/* Performance Indicator Rings */}
              <div className="p-3.5 bg-gray-950/80 border border-gray-900 rounded-xl grid grid-cols-2 gap-4">
                <div className="text-left">
                  <span className="text-gray-500 block text-[8px] uppercase font-bold mb-1">Productivity Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-mono font-bold text-emerald-400">{inspectedEmployee.productivityScore}%</span>
                    <div className="flex-1 bg-gray-905 bg-gray-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full" style={{ width: `${inspectedEmployee.productivityScore}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-gray-500 block text-[8px] uppercase font-bold mb-1">Accrued Leave Balance</span>
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="text-sm font-mono font-bold text-amber-500 block">{inspectedEmployee.leaveBalance} Days</span>
                    <span className="text-[8px] text-[#f3e5ab] font-bold block">({inspectedEmployee.leaveStatus === 'ON_LEAVE' ? 'ON LEAVE 🌴' : 'ACTIVE'})</span>
                  </div>
                </div>
              </div>

              {/* Assigned Task Queues */}
              <div className="space-y-2 text-left">
                <span className="text-gray-500 block text-[9px] uppercase font-bold text-left">Active Bench Workloads</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {tasks.filter(t => t.assignedEmployeeId === inspectedEmployee.id && t.status !== 'Completed' && t.status !== 'Cancelled').length === 0 ? (
                    <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-900 text-center text-[10px] text-gray-500 italic">
                      No active gold setting or carving tasks assigned currently.
                    </div>
                  ) : (
                    tasks.filter(t => t.assignedEmployeeId === inspectedEmployee.id && t.status !== 'Completed' && t.status !== 'Cancelled').map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setInspectedTask(t);
                          setInspectedEmployee(null);
                        }}
                        className="p-2 bg-gray-950 hover:bg-[#1a1a1c] border border-gray-900 hover:border-gray-800 cursor-pointer rounded-lg text-[10px] flex justify-between items-center transition text-left"
                      >
                        <div>
                          <b className="text-[#d4af37] font-mono mr-1.5">{t.id}</b>
                          <span className="text-gray-300 font-medium">{t.jewelryType} ({t.customerName})</span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded text-[7px] border font-bold uppercase ${getStatusColorClass(t.status)}`}>
                          {t.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Navigation Redirection Button */}
              <div className="pt-2 border-t border-gray-950 flex gap-2 border-gray-900">
                <button
                  onClick={() => {
                    setActiveTab('personnel');
                    setInspectedEmployee(null);
                  }}
                  className="py-1.5 px-3 bg-gray-950 border border-gray-800 hover:border-[#d4af37] text-gray-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 w-full mt-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" /> Open Crew Roster Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Hover Tooltip Container */}
      {hoverTooltip && hoverTooltip.visible && (
        <div 
          className="fixed pointer-events-none bg-[#121214]/95 border border-[#d4af37]/35 rounded-2xl p-4 shadow-[0_10px_25px_rgba(0,0,0,0.85)] text-left space-y-2.5 z-[9999] w-64 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            left: `${Math.min(hoverTooltip.x + 15, window.innerWidth - 275)}px`, 
            top: `${Math.min(hoverTooltip.y + 15, window.innerHeight - 180)}px` 
          }}
        >
          <div className="flex items-center gap-2 border-b border-gray-800 pb-1.5 justify-between">
            <div>
              <span className="text-[8px] uppercase tracking-widest text-[#d4af37] font-mono block">Specialist Detail</span>
              <h4 className="text-xs font-bold text-white leading-tight">{hoverTooltip.fullName}</h4>
            </div>
            <span className="text-[8px] font-mono text-gray-500 bg-gray-950 p-1 px-1.5 rounded uppercase border border-gray-800 shrink-0">
              {hoverTooltip.role}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] leading-tight text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500">Workshop Status:</span>
              <span className="font-semibold text-white">{hoverTooltip.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Success Rate:</span>
              <span className="font-bold text-[#d4af37]">{hoverTooltip.successRate}% ON-TIME</span>
            </div>

            {/* Display active task details if working */}
            {hoverTooltip.currentJobId && (
              <div className="pt-1.5 border-t border-gray-800/60 mt-1.5 text-[10px] space-y-0.5 text-left">
                <span className="text-gray-500 block uppercase tracking-wider text-[8px] font-bold">Active Assignment</span>
                <div className="flex justify-between font-mono text-white">
                  <span>Job ID:</span>
                  <span className="font-bold text-[#f3e5ab]">{hoverTooltip.currentJobId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jewelry:</span>
                  <span className="font-semibold truncate max-w-[130px]">{hoverTooltip.currentJobType}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
