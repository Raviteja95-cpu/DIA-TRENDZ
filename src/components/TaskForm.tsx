/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, User, Info, CheckCircle2, AlertTriangle, Layers, Clock, PlusCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface TaskFormProps {
  currentUser: any;
  onRefreshTasks?: () => void;
}

const safeResponseParse = async (res: Response) => {
  try {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    } else {
      const text = await res.text();
      return { message: text || `HTTP Error ${res.status}: ${res.statusText}` };
    }
  } catch (err) {
    return { message: `HTTP Parsing Error ${res.status}: ${res.statusText}` };
  }
};

export function TaskForm({ currentUser, onRefreshTasks }: TaskFormProps) {
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  // Job creation form fields
  const [customerName, setCustomerName] = useState('');
  const [jewelryType, setJewelryType] = useState<'Ring' | 'Necklace' | 'Bracelet' | 'Earrings' | 'Pendant' | 'Custom Jewelry'>('Ring');
  const [complexityLevel, setComplexityLevel] = useState<'Simple' | 'Medium' | 'Complex' | 'Premium'>('Medium');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [goldWeight, setGoldWeight] = useState(10.5);
  const [materialType, setMaterialType] = useState('18K Yellow Gold');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchActiveEmployees();
  }, []);

  const fetchActiveEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        const activeCrew = data.filter((u: any) => u.role === 'EMPLOYEE' && u.status === 'ACTIVE' && u.leaveStatus === 'ACTIVE');
        setEmployees(activeCrew);
        if (activeCrew.length > 0) {
          setAssignedEmployeeId(activeCrew[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!customerName || !assignedEmployeeId || !dueDate) {
      setFormError('Please specify client name, timeline, and an active bench artisan.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          jewelryType,
          complexityLevel,
          priority,
          goldWeight,
          materialType,
          assignedEmployeeId,
          dueDate,
          remarks,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      const data = await safeResponseParse(res);
      if (!res.ok) {
        throw new Error(data.message || 'Creation rejected by production server.');
      }

      setFormSuccess(`Manufacturing Job ticket ${data.task.id} pushed successfully!`);
      setCustomerName('');
      setRemarks('');
      setGoldWeight(10.5);
      if (onRefreshTasks) onRefreshTasks();
    } catch (err: any) {
      setFormError(err.message || 'Failed to dispatch manufacturing card.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center gap-2 pb-3.5 border-b border-gray-800 mb-5">
        <PlusCircle className="w-5 h-5 text-[#d4af37]" />
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#f3e5ab]">Create Production Job Card</h3>
          <p className="text-[10px] text-gray-400">Dispatch metal casting and bench diamond settings to crew members.</p>
        </div>
      </div>

      <form onSubmit={handleCreateTask} className="space-y-4">
        {formSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Customer / Boutique Reference</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
              placeholder="Tiffany & Co. Dubai Mall"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Jewelry Product Category</label>
            <select
              value={jewelryType}
              onChange={(e: any) => setJewelryType(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
            >
              <option value="Ring">Solitaire Ring</option>
              <option value="Necklace">Luxury Necklace</option>
              <option value="Bracelet">Bracelet / Bangle</option>
              <option value="Earrings">Earrings / studs</option>
              <option value="Pendant">Pendant mount</option>
              <option value="Custom Jewelry">Custom Design Job</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Complexity Level</label>
            <select
              value={complexityLevel}
              onChange={(e: any) => setComplexityLevel(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-gray-200"
            >
              <option value="Simple">Simple</option>
              <option value="Medium">Medium</option>
              <option value="Complex">Complex</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Priority Class</label>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-gray-200"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent priority</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gold/Pt Weight (grams)</label>
            <input
              type="number"
              value={goldWeight}
              onChange={(e) => setGoldWeight(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-gray-200 font-mono"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Material Base Alloy</label>
            <input
              type="text"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-gray-200"
              placeholder="e.g. 18K Yellow Gold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#d4af37] mb-1">Assign Bench Artisan (Available Crew)</label>
            {loading ? (
              <div className="text-xs text-gray-500 animate-pulse">Reading available bench specialists...</div>
            ) : employees.length === 0 ? (
              <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-lg text-[11px] text-rose-300">
                No active specialists available on current shift. All on leave or disabled.
              </div>
            ) : (
              <select
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200 font-semibold"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} [{emp.department} • Productivity: {emp.productivityScore}%]
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Estimated Completion Deadline</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-gray-200"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Manufacturing Guidelines / Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
            rows={3}
            placeholder="E.g. Ensure halo cluster micro-prong diamonds are aligned precisely. Cushion cut style centered..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting || employees.length === 0}
          className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(212,175,55,0.15)] transition"
        >
          {submitting ? 'Transmitting Job Info...' : 'Initialize & Distribute Manufacturing Job'}
        </button>
      </form>
    </div>
  );
}
