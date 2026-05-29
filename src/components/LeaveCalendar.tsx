/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  UserMinus, 
  PlusCircle, 
  Check, 
  X, 
  FileSpreadsheet, 
  Clock, 
  Sparkles, 
  Users, 
  Award, 
  ShieldAlert 
} from 'lucide-react';
import { LeaveRequest, User, Holiday } from '../types';

interface LeaveCalendarProps {
  currentUser: any;
  onRefreshMetrics?: () => void;
}

export function LeaveCalendar({ currentUser, onRefreshMetrics }: LeaveCalendarProps) {
  const [employees, setEmployees] = useState<User[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Leave Form State (for employees or leads requesting)
  const [leaveType, setLeaveType] = useState<'vacation' | 'sick' | 'emergency' | 'monthly'>('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Review state
  const [adminRemarks, setAdminRemarks] = useState('');
  const [reviewId, setReviewId] = useState<string | null>(null);

  // Holiday Planning State
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayName, setHolidayName] = useState('');
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');
  const [holidayDesc, setHolidayDesc] = useState('');
  const [holidayDays, setHolidayDays] = useState(1);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [submittingHoliday, setSubmittingHoliday] = useState(false);
  const [holidaySuccess, setHolidaySuccess] = useState('');
  const [holidayError, setHolidayError] = useState('');

  // Reusable overrides maps for pending holiday approvals
  const [overrideDays, setOverrideDays] = useState<{ [id: string]: number }>({});
  const [expandedStatsEmpId, setExpandedStatsEmpId] = useState<string | null>(null);

  // Employee Data Safeguard state
  const [showOthersLeaves, setShowOthersLeaves] = useState(currentUser.role !== 'EMPLOYEE');

  // Leave extension tool states
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [extensionEndDate, setExtensionEndDate] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [extendingLoading, setExtendingLoading] = useState(false);

  // Dynamic calculations for personal leave stats: "how many leaves did he taken before in past months and present month"
  const myApprovedLeaves = React.useMemo(() => {
    return requests.filter(r => r.employeeId === currentUser.id && r.status === 'APPROVED');
  }, [requests, currentUser.id]);

  const presentMonthTakenDays = React.useMemo(() => {
    let daysCount = 0;
    const currentMonthNum = 4; // May is 4 (0-indexed)
    const currentYearNum = 2026;

    myApprovedLeaves.forEach(req => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      const dur = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      if (
        (start.getFullYear() === currentYearNum && start.getMonth() === currentMonthNum) ||
        (end.getFullYear() === currentYearNum && end.getMonth() === currentMonthNum)
      ) {
        daysCount += dur;
      }
    });
    return daysCount;
  }, [myApprovedLeaves]);

  const pastMonthsTakenDays = React.useMemo(() => {
    let daysCount = 0;
    const currentMonthNum = 4; // May is 4 (0-indexed)
    const currentYearNum = 2026;

    myApprovedLeaves.forEach(req => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      const dur = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      if (
        (start.getFullYear() === currentYearNum && start.getMonth() < currentMonthNum) ||
        (end.getFullYear() === currentYearNum && end.getMonth() < currentMonthNum) ||
        (start.getFullYear() < currentYearNum)
      ) {
        daysCount += dur;
      }
    });
    return daysCount;
  }, [myApprovedLeaves]);

  // Static Calendar Mock representation for decorative scheduling flow
  const calendarMonths = [
    { name: 'May 2026', startOffset: 5, days: 31 }, // May 2026 starts on Friday (5)
    { name: 'June 2026', startOffset: 1, days: 30 } // June 2026 starts on Monday (1)
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, reqRes, holRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/leave'),
        fetch('/api/holidays')
      ]);

      if (empRes.ok && reqRes.ok) {
        setEmployees(await empRes.json());
        setRequests(await reqRes.json());
      }
      if (holRes.ok) {
        const hList = await holRes.json();
        setHolidays(hList);
        // Sync override states with holidays days
        const bounds: { [id: string]: number } = {};
        hList.forEach((h: any) => {
          bounds[h.id] = h.days;
        });
        setOverrideDays(bounds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !remarks) {
      setFormError('Please complete all requested calendar inputs and intervals.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          leaveType,
          startDate,
          endDate,
          remarks
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Creation rejected.');
      }

      setFormSuccess('Leave application registered successfully. Staged for Administrator clearance.');
      setStartDate('');
      setEndDate('');
      setRemarks('');
      setLeaveType('vacation');
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewLeave = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/leave/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId,
          status,
          adminRemarks,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        setReviewId(null);
        setAdminRemarks('');
        fetchData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error('Leave status review failure', err);
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveEndDate = isHalfDay ? holidayStart : holidayEnd;
    if (!holidayName || !holidayStart || !effectiveEndDate) {
      setHolidayError('Please complete all holiday name, start and end boundaries.');
      return;
    }

    setSubmittingHoliday(true);
    setHolidayError('');
    setHolidaySuccess('');

    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: holidayName,
          startDate: holidayStart,
          endDate: effectiveEndDate,
          description: holidayDesc,
          days: isHalfDay ? 0.5 : holidayDays,
          isHalfDay,
          createdBy: currentUser.fullName,
          creatorRole: currentUser.role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Creation rejected.');
      }

      setHolidaySuccess(
        currentUser.role === 'SUPER_ADMIN'
          ? 'Corporate Holiday set and authorized.'
          : 'Corporate Dayoff proposed. Staged for Super Admin validation.'
      );
      setHolidayName('');
      setHolidayStart('');
      setHolidayEnd('');
      setHolidayDesc('');
      setHolidayDays(1);
      setIsHalfDay(false);
      fetchData();
    } catch (err: any) {
      setHolidayError(err.message || 'Error occurred.');
    } finally {
      setSubmittingHoliday(false);
    }
  };

  const handleDecideHoliday = async (holidayId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const selectedDaysCount = overrideDays[holidayId] || 1;
      const res = await fetch('/api/holidays/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holidayId,
          days: selectedDaysCount,
          status,
          reviewerRole: currentUser.role,
          reviewerName: currentUser.fullName
        })
      });

      if (res.ok) {
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error approving holiday parameters.');
      }
    } catch (err) {
      console.error('Holiday decision review failure', err);
    }
  };

  const handleExtendLeave = async (leaveId: string) => {
    if (!extensionEndDate) {
      alert("Please specify a valid ending calendar date boundary for the extension.");
      return;
    }
    setExtendingLoading(true);
    try {
      const res = await fetch('/api/leave/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId,
          newEndDate: extensionEndDate,
          remarks: extensionReason,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        setExtendingId(null);
        setExtensionEndDate('');
        setExtensionReason('');
        fetchData();
        if (onRefreshMetrics) onRefreshMetrics();
      } else {
        const data = await res.json();
        alert(data.message || 'Could not verify extension authorization.');
      }
    } catch (err) {
      console.error('Failed extending leave request duration', err);
    } finally {
      setExtendingLoading(false);
    }
  };

  const getEmployeeLeaveStats = (empId: string) => {
    // Collect approved leaves for that specific employee
    const empRequests = requests.filter(r => r.employeeId === empId && r.status === 'APPROVED');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11

    let monthlyDays = 0;
    let yearlyDays = 0;
    const detailedLeaves: Array<{ id: string; duration: number; type: string; range: string }> = [];

    empRequests.forEach(req => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);

      // Inclusive duration calculation
      const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      detailedLeaves.push({
        id: req.id,
        duration: days,
        type: req.leaveType,
        range: `${req.startDate} to ${req.endDate}`
      });

      if (start.getFullYear() === currentYear || end.getFullYear() === currentYear) {
        yearlyDays += days;
      }

      if (
        (start.getFullYear() === currentYear && start.getMonth() === currentMonth) ||
        (end.getFullYear() === currentYear && end.getMonth() === currentMonth)
      ) {
        monthlyDays += days;
      }
    });

    return { monthlyDays, yearlyDays, detailedLeaves };
  };

  return (
    <div id="leave-management-system" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
            STAFF ATTENDANCE & LEAVE WORKFLOW
          </h2>
          <p className="text-xs text-gray-400">
            Schedule shift vacations, emergency sick leaves, company closures, and manage active roster availability.
          </p>
        </div>
      </div>

      {/* Attendance & Leave Grid Layout */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (Request Leave) or Profile Leave Balance Grid */}
          <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6 self-start space-y-6">
          <div className="pb-3 border-b border-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#f3e5ab]">
              {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') 
                ? 'Corporate Allowance Balance Tracking' 
                : 'Personal Leave Ledger Summary'}
            </span>
          </div>

          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') ? (
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#1a1a1c] to-[#121214] border border-[#d4af37]/15 animate-in fade-in">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest">Administrative Leave Ledger View</div>
              <div className="text-xl font-extrabold text-[#f3e5ab] font-mono mt-1">
                Allowance Matrix <span className="text-xs font-normal text-gray-400">(Enabled)</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic">
                Administrators have permission to edit and extend active approved technician leave times directly on our schedules.
              </p>
            </div>
          ) : (
            <div className="space-y-3 px-1 animate-in fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#1a1a1c] to-[#121214] border border-gray-800 space-y-1.5 text-left">
                <span className="text-[9px] uppercase tracking-wider text-[#d4af37] font-bold block">Present Month Absence</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-extrabold text-[#f3e5ab] font-mono">{presentMonthTakenDays} days</span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase font-mono">Approved</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-[#1a1a1c] to-[#121214] border border-gray-800 space-y-1.5 text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Past Months Absence Ledger</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-extrabold text-white font-mono">{pastMonthsTakenDays} days</span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase font-mono">Approved</span>
                </div>
              </div>
            </div>
          )}

          {/* Leave Submission Form */}
          <form onSubmit={handleCreateLeave} className="space-y-4 pt-2">
            <span className="text-[10px] text-gray-400 tracking-widest uppercase font-bold block">Apply For Leave Absence</span>

            {formSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs font-semibold">
                ✓ {formSuccess}
              </div>
            )}

            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-xl">
                ✕ {formError}
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Leave Category</label>
              <select
                value={leaveType}
                onChange={(e: any) => setLeaveType(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
              >
                <option value="vacation">Vacation Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="emergency">Emergency Absence</option>
                <option value="monthly">Monthly Standard Outing</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-gray-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Stated Reason / Details</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
                rows={3}
                placeholder="List medical verification reference, flight timetables, or emergency details..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-semibold text-xs rounded-xl hover:brightness-110 flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-black" /> File Leave Request
            </button>
          </form>
        </div>

        {/* Attendance Review List & Active Leave Calendar visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar Display Grid */}
          <div className="p-6 bg-[#121214]/95 border border-gray-800 rounded-2xl relative overflow-hidden">
            <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-4">
              FACTORY VACATION CALENDAR MAP
            </span>

            {currentUser.role === 'EMPLOYEE' && (
              <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-5">
                <div className="text-left">
                  <span className="text-[9px] text-[#d4af37] uppercase tracking-widest font-extrabold block">Colleague Schedule Safeguard</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">By default, other technicians' vacations are hidden from view.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOthersLeaves(prev => !prev)}
                  className="px-3 py-1.5 rounded-lg bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider border border-[#d4af37]/20 transition shrink-0 whitespace-nowrap self-start sm:self-auto"
                >
                  {showOthersLeaves ? 'Hide Colleague Dates' : 'Show Colleague Dates'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {calendarMonths.map((m) => (
                <div key={m.name} className="p-4 bg-gray-950/55 rounded-xl border border-gray-800/65">
                  <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 text-center text-[#f3e5ab]">{m.name}</div>
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-gray-400 tracking-wider uppercase mb-1 font-mono font-bold">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 text-xs text-white mt-1">
                    {/* Render empty offsets */}
                    {Array.from({ length: m.startOffset }).map((_, idx) => (
                      <span key={`off-${idx}`} className="text-gray-950">.</span>
                    ))}
                    {/* Render days */}
                    {Array.from({ length: m.days }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const hasLeave = requests.some(r => {
                        if (r.status !== 'APPROVED') return false;
                        if (currentUser.role === 'EMPLOYEE' && !showOthersLeaves && r.employeeId !== currentUser.id) return false;
                        const start = new Date(r.startDate).getDate();
                        const end = new Date(r.endDate).getDate();
                        const reqMonthName = new Date(r.startDate).toLocaleString('en', { month: 'long' });
                        const calMonthName = m.name.split(' ')[0];
                        return dayNum >= start && dayNum <= end && reqMonthName === calMonthName;
                      });

                      return (
                        <div
                          key={`day-${dayNum}`}
                          className={`p-1.5 rounded text-center text-[10px] font-mono leading-none border flex flex-col items-center justify-center ${
                            hasLeave
                              ? 'bg-[#d4af37] text-black border-[#aa7c11] font-bold'
                              : 'bg-[#18181a] border-gray-800 hover:border-[#d4af37]/30 text-gray-400'
                          }`}
                        >
                          <span>{dayNum}</span>
                          {hasLeave && <span className="text-[7px] tracking-tight truncate leading-none mt-0.5 max-w-[40px]">OUT</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-3 justify-center text-[10px] text-gray-500">
              <span className="w-2.5 h-2.5 bg-[#d4af37] border border-[#aa7c11] rounded" /> Admin Approved Absence
              <span className="w-2.5 h-2.5 bg-[#18181a] border border-gray-800 rounded ml-2" /> Standard Working Shift
            </div>
          </div>

          {/* Employee Attendance Tracker (Admin & Super Admin only) */}
          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
            <div className="p-6 bg-[#121214]/95 border border-gray-800 rounded-2xl text-left">
              <div className="pb-3 border-b border-gray-800 flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#f3e5ab]">Employee Absence Ledger (Monthly & Yearly)</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Programmatic oversight of approved days off and vacation segments taken by each technician, indexed by Corporate Employee ID.
              </p>

              <div className="space-y-3">
                {employees.map((emp, index) => {
                  const stats = getEmployeeLeaveStats(emp.id);
                  const isExpanded = expandedStatsEmpId === emp.id;
                  return (
                    <div key={`${emp.id}-${index}`} className="p-3 bg-gray-950/60 border border-gray-900 rounded-xl hover:border-gray-800 transition text-xs">
                      <div 
                        onClick={() => setExpandedStatsEmpId(isExpanded ? null : emp.id)}
                        className="flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div>
                          <span className="text-[9px] font-mono text-[#d4af37] tracking-wider uppercase">{emp.id} &bull; {emp.department || 'Workstation'}</span>
                          <h4 className="text-xs font-bold text-white uppercase mt-0.5">{emp.fullName}</h4>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-[8px] text-slate-500 uppercase font-mono block leading-none font-semibold">This Month</span>
                            <span className="text-xs font-bold font-mono text-blue-400 block mt-0.5">{stats.monthlyDays} days</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-slate-500 uppercase font-mono block leading-none font-semibold">This Year</span>
                            <span className="text-xs font-bold font-mono text-emerald-400 block mt-0.5">{stats.yearlyDays} days</span>
                          </div>
                          <div className="text-slate-500 text-[10px] w-4 text-center">
                            {isExpanded ? '▲' : '▼'}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-gray-900 space-y-2 animate-in fade-in duration-150">
                          <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#f3e5ab] block">Approved Absence Registry Logs</span>
                          {stats.detailedLeaves.length === 0 ? (
                            <p className="text-[10px] text-gray-500 italic">No approved absence intervals recorded in the system.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {stats.detailedLeaves.map((dt, index) => (
                                <div key={`${dt.id}-${index}`} className="p-2.5 border border-gray-900 bg-gray-950/80 rounded-lg text-[10px] flex justify-between items-center">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-gray-300 capitalize flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" /> {dt.type}
                                    </span>
                                    <span className="text-gray-500 font-mono text-[9px] block">{dt.range}</span>
                                  </div>
                                  <span className="font-mono text-[#d4af37] font-black bg-[#d4af37]/10 border border-[#d4af37]/20 px-2 py-0.5 rounded">
                                    {dt.duration}d
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div> )}


          {/* Corporate Holidays Management */}
          <div className="p-6 bg-[#121214]/95 border border-gray-800 rounded-2xl text-left space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-gray-800 gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#f3e5ab]">Company Holidays & Dayoffs Planner</span>
              </div>
              <span className="text-[9px] bg-indigo-950/80 border border-indigo-900 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold w-max uppercase tracking-wider">
                DEAL CAPS DECIDED BY SUPER ADMIN ONLY
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Proposed holiday form */}
              {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') ? (
                <form onSubmit={handleCreateHoliday} className="space-y-4">
                  <span className="text-[10px] text-[#f3e5ab] font-mono font-bold uppercase tracking-widest block">Propose/Schedule Holiday</span>
                  
                  {holidaySuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/35 rounded-xl text-emerald-200 text-xs font-bold">
                      ✓ {holidaySuccess}
                    </div>
                  )}
                  {holidayError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/35 rounded-xl text-red-200 text-xs text-left">
                      ✕ {holidayError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Holiday Title / Occasion</label>
                    <input
                      type="text"
                      value={holidayName}
                      onChange={(e) => setHolidayName(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200 focus:border-[#d4af37]/60 focus:outline-none"
                      placeholder="e.g. Founder's Day, Summer Solstice Closure"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-gray-400">Duration Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsHalfDay(false);
                          if (holidayDays === 0.5) setHolidayDays(1);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition select-none cursor-pointer ${
                          !isHalfDay
                            ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/35'
                            : 'bg-[#1c1c1e] text-gray-400 border border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        Full Day Holiday
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsHalfDay(true);
                          setHolidayDays(0.5);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition select-none cursor-pointer ${
                          isHalfDay
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : 'bg-[#1c1c1e] text-gray-400 border border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        Half Day Holiday
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={holidayStart}
                        onChange={(e) => {
                          setHolidayStart(e.target.value);
                          if (isHalfDay) {
                            setHolidayEnd(e.target.value);
                          }
                        }}
                        className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-gray-350 text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                        {isHalfDay ? 'End Date (Locked)' : 'End Date'}
                      </label>
                      <input
                        type="date"
                        value={isHalfDay ? holidayStart : holidayEnd}
                        onChange={(e) => {!isHalfDay && setHolidayEnd(e.target.value)}}
                        disabled={isHalfDay}
                        className={`w-full border rounded-lg text-xs p-2 text-gray-300 ${
                          isHalfDay 
                            ? 'bg-gray-900 border-gray-850 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#1c1c1e] border-gray-800'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {currentUser.role === 'SUPER_ADMIN' ? (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Final Holiday Days Duration</label>
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        disabled={isHalfDay}
                        value={isHalfDay ? 0.5 : holidayDays}
                        onChange={(e) => setHolidayDays(Number(e.target.value))}
                        className={`w-full border rounded-lg text-xs p-2 font-mono text-gray-200 ${
                          isHalfDay 
                            ? 'bg-gray-900 border-gray-850 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#1c1c1e] border-gray-800'
                        }`}
                        required
                      />
                      <span className="text-[9px] text-gray-500 mt-1 block font-sans">
                        {isHalfDay 
                          ? 'Duration is locked at 0.5 days for Half Day Holiday.' 
                          : 'Super Admins define the finalized duration counts of the dayoffs directly.'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#1c1c1e] border border-gray-800 rounded-xl text-[10px] text-slate-400 leading-normal">
                      {isHalfDay 
                        ? '⚠ Created half-day holiday will stage as PENDING decision until vetted by a Super Admin with 0.5 days credit.'
                        : '⚠ Created holidays will initialize under automatically calculated intervals and stage as PENDING decision until vetted by a Super Admin.'}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Closure Guidelines / Notice</label>
                    <textarea
                      value={holidayDesc}
                      onChange={(e) => setHolidayDesc(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-gray-200"
                      placeholder="Describe security lockups, workshop guidelines, or team messages..."
                      rows={2}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingHoliday}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl select-none cursor-pointer"
                  >
                    {submittingHoliday ? 'Registering...' : 'Publish / Propose Holiday'}
                  </button>
                </form>
              ) : (
                <div className="p-5 bg-gray-950/40 border border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center text-center text-gray-500 text-[11px] space-y-2">
                  <ShieldAlert className="w-6 h-6 text-indigo-500/40 animate-pulse" />
                  <span className="font-extrabold text-gray-450 uppercase text-[10px] tracking-wider text-slate-350">Admins Access Only</span>
                  <p className="max-w-[190px] text-slate-450 text-slate-500 leading-relaxed">Only workplace Admins or Super Admins hold authorization credentials to compile corporate closures.</p>
                </div>
              )}

              {/* Holiday list */}
              <div className="space-y-4">
                <span className="text-[10px] text-[#f3e5ab] font-mono font-bold uppercase tracking-widest block">Active Corporate Closure List</span>
                
                {holidays.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500 border border-dashed border-gray-850 rounded-xl italic">
                    No company dayoffs or holidays recorded.
                  </div>
                ) : (
                  <div className="space-y-3 h-[290px] overflow-y-auto pr-1">
                    {holidays.map(h => (
                      <div key={h.id} className="p-3 bg-gray-950/60 border border-gray-900 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h5 className="font-bold text-white uppercase text-xs leading-tight flex items-center gap-1.5 flex-wrap">
                              <span>{h.name}</span>
                              {h.isHalfDay && (
                                <span className="text-[8px] bg-indigo-950 text-indigo-450 text-indigo-400 border border-indigo-900/50 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                                  Half Day
                                </span>
                              )}
                            </h5>
                            <span className="text-[9.5px] text-gray-500 block mt-0.5">{h.startDate} to {h.endDate}</span>
                          </div>
                          {h.status === 'APPROVED' ? (
                            <span className="bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 text-[9px] font-mono font-bold py-0.5 px-2 rounded-full shrink-0">
                              APPROVED ({h.days} days)
                            </span>
                          ) : (
                            <span className="bg-amber-950/60 border border-amber-900/40 text-amber-400 text-[8.5px] font-mono font-bold py-0.5 px-2 rounded-full shrink-0 animate-pulse">
                              PENDING OVERRIDE ({h.days}d)
                            </span>
                          )}
                        </div>

                        {h.description && (
                          <p className="text-[10px] text-slate-400 leading-normal italic">&ldquo;{h.description}&rdquo;</p>
                        )}
                        <span className="text-[8.5px] text-slate-600 block leading-none font-mono">Proposed by: {h.createdBy} ({h.creatorRole})</span>
                        
                        {/* Super admin approval tool for pending decision */}
                        {h.status === 'PENDING_DECISION' && currentUser.role === 'SUPER_ADMIN' && (
                          <div className="p-2.5 bg-[#17171a] rounded-lg border border-indigo-950/40 space-y-2 mt-2">
                            <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#d4af37] block">Super Admin Action Needed</span>
                            <p className="text-[9.5px] text-slate-400">Establish the finalized approved days count:</p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                value={overrideDays[h.id] ?? h.days}
                                onChange={(e) => setOverrideDays({ ...overrideDays, [h.id]: Number(e.target.value) })}
                                className="w-16 bg-[#0a0a0c] border border-gray-800 p-1 text-[11px] font-mono rounded text-center text-white"
                              />
                              <button
                                onClick={() => handleDecideHoliday(h.id, 'APPROVED')}
                                className="p-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[9.5px] font-bold rounded uppercase transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDecideHoliday(h.id, 'REJECTED')}
                                className="p-1 px-3 bg-rose-600 hover:bg-rose-500 text-white text-[9.5px] font-bold rounded uppercase transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Roster Requests (Admin Approval Section) */}
          <div className="p-6 bg-[#121214]/95 border border-gray-800 rounded-2xl">
            <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-4">
              Pending Clearance Applications
            </span>

            {loading ? (
              <div className="text-center py-6 text-xs text-gray-500">Reading calendar records...</div>
            ) : requests.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No leave requests filed in the system.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {requests
                  .filter(req => currentUser.role !== 'EMPLOYEE' || req.employeeId === currentUser.id)
                  .map((req, index) => {
                    const days = Math.max(1, Math.round((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
                    return (
                      <div key={`${req.id}-${index}`} className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                          <div className="text-left">
                            <span className="text-[10px] font-mono text-[#d4af37]">{req.id} • {req.leaveType.toUpperCase()}</span>
                            <h4 className="text-sm font-semibold text-white uppercase mt-0.5">{req.employeeName}</h4>
                            <span className="text-[11px] text-gray-400 block mt-0.5">Duration: {req.startDate} to {req.endDate} ({days} days)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {req.status === 'PENDING' ? (
                              currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' ? (
                                reviewId === req.id ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Optional approvals remark"
                                      value={adminRemarks}
                                      onChange={(e) => setAdminRemarks(e.target.value)}
                                      className="p-1 px-2.5 bg-[#161618] border border-gray-800 text-xs rounded text-white"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => handleReviewLeave(req.id, 'APPROVED')}
                                        className="p-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleReviewLeave(req.id, 'REJECTED')}
                                        className="p-1 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setReviewId(req.id)}
                                    className="p-1 px-3.5 bg-gray-800 hover:bg-[#d4af37]/15 border border-gray-700 hover:border-[#d4af37]/45 text-white rounded text-[11px] transition select-none cursor-pointer"
                                  >
                                    Process Clearance
                                  </button>
                                )
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/40 text-amber-400 border border-amber-500/30">PENDING APPR</span>
                              )
                            ) : (
                              <div className="flex flex-col items-end gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {req.status}
                                </span>
                                
                                {req.status === 'APPROVED' && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
                                  <button
                                    onClick={() => {
                                      setExtendingId(req.id === extendingId ? null : req.id);
                                      setExtensionEndDate(req.endDate);
                                      setExtensionReason('');
                                    }}
                                    className="text-[10px] text-[#d4af37] hover:underline font-bold focus:outline-none"
                                  >
                                    {extendingId === req.id ? 'Close Tool' : 'Extend Leave'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-800/40 text-[11px] text-gray-400 text-left">
                          <b>Employee remark:</b> {req.remarks}
                          {req.adminRemarks && <div className="mt-1 text-emerald-400"><b>Admin Review Notes:</b> {req.adminRemarks}</div>}
                        </div>

                        {extendingId === req.id && (
                          <div className="p-3.5 bg-[#161618] border border-gray-800 rounded-lg space-y-3 mt-3 animate-in fade-in">
                            <span className="text-[10px] text-[#f3e5ab] font-bold uppercase tracking-wider block">Administrator Extend Leave Period</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">New Holiday Endbound Date</label>
                                <input
                                  type="date"
                                  value={extensionEndDate}
                                  onChange={(e) => setExtensionEndDate(e.target.value)}
                                  className="w-full bg-[#0a0a0c] border border-gray-800 text-xs text-white p-2 rounded focus:outline-none focus:border-[#d4af37]"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Extension Purpose Remarks</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Additional recovery time approved"
                                  value={extensionReason}
                                  onChange={(e) => setExtensionReason(e.target.value)}
                                  className="w-full bg-[#0a0a0c] border border-gray-808 text-xs text-white p-2 rounded focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setExtendingId(null)}
                                className="px-3 py-1 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded text-[10px] font-bold uppercase"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleExtendLeave(req.id)}
                                disabled={extendingLoading}
                                className="px-3.5 py-1 bg-gradient-to-r from-teal-600 to-[#d4af37] hover:brightness-110 text-white rounded text-[10px] font-bold uppercase"
                              >
                                {extendingLoading ? 'Extending...' : 'Apply Extension'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
