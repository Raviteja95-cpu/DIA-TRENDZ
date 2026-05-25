/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, UserMinus, PlusCircle, Check, X, FileSpreadsheet, Clock, Sparkles } from 'lucide-react';
import { LeaveRequest, User } from '../types';

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
      const [empRes, reqRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/leave')
      ]);

      if (empRes.ok && reqRes.ok) {
        setEmployees(await empRes.json());
        setRequests(await reqRes.json());
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
        throw new Error(data.message || 'Creation rejected. Check remaining balance.');
      }

      setFormSuccess('Leave application registered. Staged for Administrator clearance.');
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

  return (
    <div id="leave-management-system" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
            STAFF ATTENDANCE & LEAVE WORKFLOW
          </h2>
          <p className="text-xs text-gray-400">
            Schedule shift vacations, emergency sick leaves, and manage active roster availability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (Request Leave) or Profile Leave Balance Grid */}
        <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6 self-start space-y-6">
          <div className="pb-3 border-b border-gray-800 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#f3e5ab]">My Allotted Leave Balances</span>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-[#1a1a1c] to-[#121214] border border-[#d4af37]/15">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">Available Vacation Credit</div>
            <div className="text-2xl font-extrabold text-[#f3e5ab] font-mono mt-1">
              {currentUser.leaveBalance !== undefined ? currentUser.leaveBalance : 15} <span className="text-xs font-normal text-gray-400">Days Left</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">Standard active employee joining allowance balance.</p>
          </div>

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
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-semibold text-xs rounded-xl hover:brightness-110 flex items-center justify-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" /> Apply
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
              <div className="space-y-4">
                {requests.map((req) => {
                  const days = Math.max(1, Math.round((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
                  return (
                    <div key={req.id} className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                        <div>
                          <span className="text-[10px] font-mono text-[#d4af37]">{req.id} • {req.leaveType.toUpperCase()}</span>
                          <h4 className="text-sm font-semibold text-white">{req.employeeName}</h4>
                          <span className="text-[11px] text-gray-400">Duration: {req.startDate} to {req.endDate} ({days} days)</span>
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
                                  className="p-1 px-3.5 bg-gray-800 hover:bg-[#d4af37]/15 border border-gray-700 hover:border-[#d4af37]/45 text-white rounded text-[11px] transition"
                                >
                                  Process Clearance
                                </button>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/40 text-amber-400 border border-amber-500/30">PENDING APPR</span>
                            )
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {req.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-800/40 text-[11px] text-gray-400">
                        <b>Employee remark:</b> {req.remarks}
                        {req.adminRemarks && <div className="mt-1 text-emerald-400"><b>Admin Review Notes:</b> {req.adminRemarks}</div>}
                      </div>
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
